const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    // "text" is a normal message; "group_invite" is a group invitation card
    type: {
      type: String,
      enum: ["text", "group_invite"],
      default: "text",
    },
    // Only populated when type === "group_invite"
    groupInvite: {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
      groupName: { type: String },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      // "pending" | "accepted" | "rejected"
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    },
    // Emoji reactions: each entry is one user's reaction to this message.
    // A user can only have one active emoji per message (toggle behaviour).
    reactions: [
      {
        emoji:  { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    // Tracks which users have read this message
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
