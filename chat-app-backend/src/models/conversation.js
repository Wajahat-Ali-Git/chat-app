const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupName: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Conversation", conversationSchema);
