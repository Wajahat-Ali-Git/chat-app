const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { searchUsers } = require("../controllers/userController");

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
router.get("/", protect,searchUsers)
module.exports = router;
