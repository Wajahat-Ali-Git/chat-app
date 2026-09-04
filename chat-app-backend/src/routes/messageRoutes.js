const express = require("express");

const {
  sendMessage,
  getMessages,
  getUnreadCount,
  respondToInvite,
  reactToMessage,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);

// Must come before /:conversationId so Express doesn't treat "unread" as an ID
router.get("/:conversationId/unread", protect, getUnreadCount);

router.get("/:conversationId", protect, getMessages);

// Respond to a group invite message
router.post("/:messageId/respond-invite", protect, respondToInvite);

// React to a message (toggle)
router.post("/:messageId/react", protect, reactToMessage);

module.exports = router;
