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

module.exports = {
  sendMessage,
  getMessages,
  getUnreadCount,
};
