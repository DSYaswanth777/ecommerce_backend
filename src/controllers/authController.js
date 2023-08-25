//**User Model Import */
const User = require("../models/User");
//** Importing bcrypt for password hashing */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Import axios for making API requests
//**OTP generator Function */
async function sendOtp(mobile, otpRegenerationCount) {
  if (otpRegenerationCount >= 3) {
    throw new Error("OTP regeneration limit exceeded");
  }

  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP

  try {
    const response = await axios.get(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=Your OTP code is ${otp}&language=english&flash=0&numbers=${mobile}`
    );

    if (response.data.return) {
      return otp;
    } else {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    throw error;
  }
}
//**Controller For Signup */
exports.signup = async (req, res) => {
  const { name, age, mobile, email, password, confirmPassword } = req.body;
  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ $or: [{ mobile }, { email }] });
    if (user) {
      return res.status(400).json({
        message: "User with the same mobile number or email already exists",
      });
    }

    // Generate and send OTP
    const otp = await sendOtp(mobile, 0);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      age,
      mobile,
      email,
      password: hashedPassword,
      otp,
      role:"customer",
      otpRegenerationCount: 1, // Initial count
      isVerified: false,
    });

    await newUser.save();
    res.status(201).json({
      message:
        "User registered successfully. You need to verify your mobile to login.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User registration failed", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp, mobile } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp === otp) {
      // OTP is valid
      user.otp = null; // Clear the OTP after successful verification
      user.isVerified = true; // Set the isVerified flag to true
      await user.save();

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // Invalid OTP
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
};
//**Controller For Login */
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: username }, { mobile: username }],
    });
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Incorrect username" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: `${user.name}, You have successfully Logged In Happy Shopping`,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        age: user.age,
        role:user.role
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

exports.profileUpdate = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const originalName = user.name;
    const originalEmail = user.email;
    user.name = name;
    user.email = email;
    await user.save();
    let message = "";
    if (name !== originalName) {
      message += "You have updated your name. ";
    }
    if (email !== originalEmail) {
      message += "You have updated your email. ";
    }
    return res.status(200).json({ message: message || "No changes made" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
};
exports.forgotPassword =  async (req, res) => {
  const { mobile } = req.body;

  try {
    const user = await User.findOne({ mobile });

    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP and send
    const otp = await sendOtp(mobile, user.otpRegenerationCount);
    console.log('Generated OTP:', otp); // Add this line

    // Update user's OTP and regeneration count
    user.resetOTP = otp;
    user.otpRegenerationCount += 1;
    await user.save();

    return res.status(200).json({ message: 'OTP sent to your mobile' });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
}
exports.resetPassword= async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User Stored OTP:', user.resetOTP); // Add this line
    console.log('Received OTP:', otp); // Add this line

    if (parseInt(user.resetOTP) !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = null; // Invalidate the OTP
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}
