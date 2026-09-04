const Conversation = require("../models/conversation");
const Message = require("../models/Message");

// Create conversation
const createConversation = async (req, res) => {
  try {
    const { reciverId } = req.body;

    // Check if the conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, reciverId] },
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    conversation = await Conversation.create({
      participants: [req.user._id, reciverId],
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user conversations — each item includes an unreadCount for the requesting user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all conversations the user is part of
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "-password")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name" } })
      .sort({ updatedAt: -1 });

    if (conversations.length === 0) {
      return res.status(200).json([]);
    }

    const conversationIds = conversations.map((c) => c._id);

    // Single aggregation: count unread messages per conversation for this user
    // "Unread" = not sent by me AND my userId is not in readBy
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      {
        $group: {
          _id: "$conversation",
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a quick lookup map  { conversationId -> unreadCount }
    const unreadMap = {};
    unreadAgg.forEach(({ _id, count }) => {
      unreadMap[_id.toString()] = count;
    });

    // Attach unreadCount to each conversation plain object
    const result = conversations.map((c) => {
      const obj = c.toObject();
      obj.unreadCount = unreadMap[c._id.toString()] || 0;
      return obj;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create group conversation
const createGroup = async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;

    // Validate input
    if (!groupName || !participantIds || participantIds.length === 0) {
      return res.status(400).json({ 
        message: "Group name and at least one participant are required" 
      });
    }

    // Add the creator to participants if not already included
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

    // Create the group conversation
    const groupConversation = await Conversation.create({
      participants: allParticipants,
      isGroup: true,
      groupName,
      createdBy: req.user._id,
    });

    // Populate participants for the response
    const populatedGroup = await Conversation.findById(groupConversation._id)
      .populate("participants", "-password")
      .populate("createdBy", "-password");

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite member to group — sends a group_invite message to the target user's DM
const inviteMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId } = req.body;
    const inviterId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Load the group
    const group = await Conversation.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.isGroup) {
      return res.status(400).json({ message: "This is not a group conversation" });
    }

    // Only group members may invite
    const isMember = group.participants.some(
      (p) => p.toString() === inviterId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Target must not already be in the group
    const alreadyMember = group.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Prevent duplicate pending invites for the same group
    const existingInvite = await Message.findOne({
      type: "group_invite",
      "groupInvite.groupId": groupId,
      "groupInvite.status": "pending",
      // The invite was sent TO the target user — find a DM between them that contains it
    }).populate("conversation");

    if (existingInvite) {
      const dmConvo = existingInvite.conversation;
      const inDM =
        dmConvo &&
        !dmConvo.isGroup &&
        dmConvo.participants.some((p) => p.toString() === userId.toString());
      if (inDM) {
        return res
          .status(400)
          .json({ message: "A pending invite has already been sent to this user" });
      }
    }

    // Find or create a 1-on-1 DM between inviter and target
    let dmConversation = await Conversation.findOne({
      isGroup: { $ne: true },
      participants: { $all: [inviterId, userId], $size: 2 },
    });

    if (!dmConversation) {
      dmConversation = await Conversation.create({
        participants: [inviterId, userId],
        isGroup: false,
      });
    }

    // Create the group_invite message
    const inviteMessage = await Message.create({
      conversation: dmConversation._id,
      sender: inviterId,
      text: `You have been invited to join "${group.groupName}"`,
      type: "group_invite",
      groupInvite: {
        groupId: group._id,
        groupName: group.groupName,
        invitedBy: inviterId,
        status: "pending",
      },
      readBy: [inviterId],
    });

    // Update DM's lastMessage
    await Conversation.findByIdAndUpdate(dmConversation._id, {
      lastMessage: inviteMessage._id,
    });

    // Populate for the socket emit
    const populated = await Message.findById(inviteMessage._id)
      .populate("sender", "-password")
      .populate("groupInvite.invitedBy", "-password");

    // Emit via socket to both users' personal rooms
    const io = req.app.get("io");
    if (io) {
      io.to(dmConversation._id.toString()).emit("new_message", populated);
      io.to(userId.toString()).emit("new_message", populated);
    }

    res.status(201).json({
      message: "Invite sent",
      inviteMessage: populated,
      dmConversationId: dmConversation._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if it's a group
    if (!conversation.isGroup) {
      return res.status(400).json({ message: "This is not a group conversation" });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Remove the user from participants
    conversation.participants = conversation.participants.filter(
      (participantId) => participantId.toString() !== req.user._id.toString()
    );

    // If no participants left, delete the conversation
    if (conversation.participants.length === 0) {
      await Conversation.findByIdAndDelete(conversationId);
      return res.status(200).json({ 
        message: "Group deleted as no members remain" 
      });
    }

    // If the creator left, transfer ownership to the first remaining participant
    if (conversation.createdBy && conversation.createdBy.toString() === req.user._id.toString()) {
      conversation.createdBy = conversation.participants[0];
    }

    await conversation.save();

    res.status(200).json({ 
      message: "Successfully left the group",
      conversation: conversation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createConversation,
  getConversations,
  createGroup,
  inviteMember,
  leaveGroup,
};
