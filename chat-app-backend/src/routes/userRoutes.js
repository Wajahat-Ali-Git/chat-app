const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
router.get("/unprotect", async (req, res) => {
  res.send("Unprotected route");
});
module.exports = router;
