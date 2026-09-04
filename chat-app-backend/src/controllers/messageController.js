const Message = require("../models/Message");
const Conversation = require("../models/conversation");

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    // Create message — sender has already "read" their own message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
      readBy: [senderId],
    });

    // Update lastMessage on the conversation and get participants back
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: message._id },
      { new: true },
    ).populate("participants", "_id");

    // Populate sender for the response & socket emit
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "-password",
    );

    const io = req.app.get("io");
    if (io) {
      // Emit to the conversation room (for users currently viewing this chat)
      io.to(conversationId).emit("new_message", populatedMessage);

      // Also emit directly to each participant's personal userId room so they
      // get the notification even if they are in a different conversation
      if (conversation?.participants) {
        conversation.participants.forEach((participant) => {
          const participantId = participant._id.toString();
          // Skip sender — they already receive it via the conversation room
          if (participantId !== senderId.toString()) {
            io.to(participantId).emit("new_message", populatedMessage);
          }
        });
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MESSAGES — returns all messages and marks them as read for the requester
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "-password")
      .sort({ createdAt: 1 });

    // Mark every unread message in this conversation as read by this user
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    // Notify clients in the room so badges clear on other devices/tabs
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("messages_read", {
        conversationId,
        userId: userId.toString(),
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET UNREAD COUNT — messages not sent by me and not yet read by me
const getUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const count = await Message.countDocuments({
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ conversationId, unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESPOND TO GROUP INVITE — accept or reject
const respondToInvite = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { response } = req.body; // "accepted" | "rejected"
    const userId = req.user._id;

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ message: "Response must be 'accepted' or 'rejected'" });
    }

    // Load the invite message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.type !== "group_invite") {
      return res.status(400).json({ message: "This message is not a group invite" });
    }
    if (message.groupInvite.status !== "pending") {
      return res.status(400).json({ message: "This invite has already been responded to" });
    }

    // Only the intended recipient (non-sender in the DM) can respond
    const dm = await Conversation.findById(message.conversation);
    if (!dm) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const isRecipient =
      dm.participants.some((p) => p.toString() === userId.toString()) &&
      message.sender.toString() !== userId.toString();

    if (!isRecipient) {
      return res.status(403).json({ message: "You cannot respond to this invite" });
    }

    // Update the invite status
    message.groupInvite.status = response;
    await message.save();

    if (response === "accepted") {
      // Add the user to the group
      const group = await Conversation.findById(message.groupInvite.groupId);
      if (!group) {
        return res.status(404).json({ message: "Group no longer exists" });
      }

      const alreadyMember = group.participants.some(
        (p) => p.toString() === userId.toString()
      );
      if (!alreadyMember) {
        group.participants.push(userId);
        await group.save();
      }
    }

    // Emit the updated message so both users see the new status in real time
    const populated = await Message.findById(messageId)
      .populate("sender", "-password")
      .populate("groupInvite.invitedBy", "-password");

    const io = req.app.get("io");
    if (io) {
      io.to(message.conversation.toString()).emit("invite_response", populated);
    }

    res.status(200).json({
      message: response === "accepted" ? "Joined the group!" : "Invite declined.",
      inviteMessage: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REACT TO MESSAGE — toggle: adds the emoji, or removes it if already set by same user
const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Same emoji — remove it (toggle off)
        message.reactions.splice(existingIndex, 1);
      } else {
        // Different emoji — replace it
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // No existing reaction — add it
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    const populated = await Message.findById(messageId).populate(
      "sender",
      "-password"
    );

    // Emit to everyone in the conversation room so reactions update live
    const io = req.app.get("io");
    if (io) {
      io.to(message.conversation.toString()).emit("reaction_updated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadCount,
  respondToInvite,
  reactToMessage,
};
