const express = require("express");

const {
  sendMessage,
  getMessages,
} = require("../controllers/MessageController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);

router.get("/:conversationId", protect, getMessages);

module.exports = router;
