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
      .populate("lastMessage")
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

// Invite member to group
const inviteMember = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if it's a group
    if (!conversation.isGroup) {
      return res.status(400).json({ message: "This is not a group conversation" });
    }

    // Check if requesting user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Check if user is already a participant
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Add the new participant
    conversation.participants.push(userId);
    await conversation.save();

    // Return updated conversation
    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "-password")
      .populate("createdBy", "-password")
      .populate("lastMessage");

    res.status(200).json(updatedConversation);
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
