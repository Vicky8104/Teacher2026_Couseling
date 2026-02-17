const User = require("../models/User");

// GET LOGGED IN USER DETAILS
const getMe = async (req, res) => {
  try {
    const user = await User.findOne({
      post: req.user.post,
      subject: req.user.subject,
      rollNo: req.user.rollNo,
      email: req.user.email
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


// UPDATE IF OTHER
const updateOther = async (req, res) => {
  try {
    const { otherOption } = req.body;

    const user = await User.findOneAndUpdate(
      {
        post: req.user.post,
        subject: req.user.subject,
        rollNo: req.user.rollNo,
        email: req.user.email
      },
      { otherOption },
      { new: true }
    );

    res.json({ message: "Updated Successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getMe, updateOther };
