const express = require("express");

const router = express.Router();
const {
  getConversations, 
  createConversation, 
  createGroup, 
  inviteMember, 
  leaveGroup
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getConversations);
router.post("/", protect, createConversation);
router.post("/group", protect, createGroup);
router.post("/:id/invite", protect, inviteMember);
router.post("/:id/leave", protect, leaveGroup);

module.exports = router;