const User = require("../models/user");

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          name: {
            $regex: req.query.search,
            $options: "i",
          },
        }
      : {};

    const users = await User.find(keyword)
      .find({
        _id: { $ne: req.user._Id },
      })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  searchUsers,
};
