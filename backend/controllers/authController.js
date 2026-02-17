const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// LOGIN + SEND OTP
const login = async (req, res) => {
  try {
    const { post, subject, rollNo, email } = req.body;

    // Check user exists
    const user = await User.findOne({ post, subject, rollNo, email });

    if (!user) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const otpCode = generateOtp();

    // Save OTP
    await Otp.create({
      post,
      subject,
      rollNo,
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
    });

    // Send Email
    await sendEmail(email, otpCode);

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { post, subject, rollNo, email, otp } = req.body;

    const record = await Otp.findOne({
      post,
      subject,
      rollNo,
      email,
      otp
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Generate JWT
    const token = jwt.sign(
      { post, subject, rollNo, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { login, verifyOtp };
