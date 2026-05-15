const Conversation = require("../models/conversation");

// Create conversation
const createConversation = async (req, res) => {
  try {
    const { reciverId } = req.body;

    // check if the conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user._id, reciverId],
      },
    });

    // if exist return existing
    if (conversation) {
      return res.status(200).json(conversation);
    }

    // create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, reciverId],
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get user conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createConversation,
  getConversations,
};
