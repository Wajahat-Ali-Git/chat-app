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

module.exports = {
  createConversation,
  getConversations,
};
