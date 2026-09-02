const Message = require("../models/message");
const Conversation = require("../models/conversation");

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    // create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
    });

    // update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    // populate sender
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "-password",
    );

    // Emit the new message to all clients in the conversation room
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("new_message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MESSAGES
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "-password")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
