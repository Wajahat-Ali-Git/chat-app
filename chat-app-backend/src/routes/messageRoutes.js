const express = require("express");

const {
  sendMessage,
  getMessages,
  getUnreadCount,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);

// Must come before /:conversationId so Express doesn't treat "unread" as an ID
router.get("/:conversationId/unread", protect, getUnreadCount);

router.get("/:conversationId", protect, getMessages);

module.exports = router;
