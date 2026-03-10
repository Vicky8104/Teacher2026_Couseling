const User = require("../models/User");
const School = require("../models/School");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/Mailer");

// ================= OTP generator =================
function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// =================================================
// 🚀 SEND OTP (CASE-INSENSITIVE MATCH)
// =================================================

async function sendOtp(req, res) {
  try {
    const { post, subject, rollno, email } = req.body;

    console.log("REQ BODY:", req.body);

    // DB me user search
    const user = await User.findOne({
      post: post,
      subject: subject,
      rollno: rollno,
      email: email.toLowerCase() // lowercase ensure
    });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ OTP generate karo
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    await user.save();

    console.log("Sending OTP to:", user.email, "OTP:", otp);

    // OTP email bhejo
    await sendOTPEmail(user.email, otp);
    console.log("OTP sent successfully!");

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// =================================================
// 🚀 VERIFY OTP (CASE-INSENSITIVE MATCH)
// =================================================
async function verifyOtp(req, res) {
  try {
    const { post, subject, email, otp } = req.body;

    const user = await User.findOne({
      post: post,
      subject: { $regex: `^${subject}$`, $options: "i" },
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP after verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // ================= JWT TOKEN =================
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        post: user.post,
        subject: user.subject,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

   res.status(200).json({
  message: "OTP verified successfully",
  token,
  user
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// =================================================
// GET PERSONAL DETAILS
// =================================================
async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .select("-otp -otpExpiry");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// =================================================
// GET SCHOOLS (POST + SUBJECT BASED)
// =================================================
// async function getSchools(req, res) {
//   try {
//     const { post, subject } = req.query;

//     const schools = await School.find({
//       post,
//       subject: { $regex: `^${subject}$`, $options: "i" },
//     });

//     res.status(200).json({ schools });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }
async function getSchools(req, res) {
  try {

    const { post, subject } = req.query;

    const schools = await School.find({
      post,
      subject: { $regex: `^${subject}$`, $options: "i" },
    });

    res.status(200).json({ schools });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
// =================================================
// SAVE SCHOOL CHOICES
// =================================================
async function submitSchools(req, res) {
  try {
    const { selectedSchools } = req.body;

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.schoolChoices = selectedSchools;

    await user.save();

    res.status(200).json({
      message: "School choices saved successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
  getUser,
  getSchools,
  submitSchools,
};
