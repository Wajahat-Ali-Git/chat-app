const express = require("express");

const router = express.Router();
const {getConversations, createConversation} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",protect, getConversations);
router.post("/",protect, createConversation);

module.exports = router;