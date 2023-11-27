//**User Model Import */
const User = require("../models/User");
//** Importing bcrypt for password hashing */
const bcrypt = require("bcryptjs");
//**Importing OTP service */
const sendOtp = require("../utilities/otpService");
//**Import express validation */
const { validationResult } = require("express-validator");
//**Importing Email utility */
const { sendWelcomeEmail } = require("../utilities/welcomeEmail");
//**Importing Token Geneartion utility */
const { generateToken } = require("../utilities/tokenGeneration");
const { passwordChangeEmail } = require("../utilities/passwordChangeEmail");

//**Controller For Signup */
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, mobile, email, password, confirmPassword } = req.body;
  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  //**Checking for user existence */
  try {
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "User with the same mobile number or email already exists",
        });
      } else {
        // Generate and send new OTP
        const otp = await sendOtp(mobile, existingUser.otpRegenerationCount);
        // Update user's OTP and regeneration count
        existingUser.otp = otp;
        existingUser.otpRegenerationCount += 1;
        await existingUser.save();
        return res.status(200).json({
          message:
            "User already registered but not verified. New OTP sent to your mobile.",
        });
      }
    }
    // Generate and send OTP
    const otp = await sendOtp(mobile, 0);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Create a new user
    const newUser = new User({
      name,
      mobile,
      email,
      password: hashedPassword,
      otp,
      role: "customer",
      otpRegenerationCount: 1,
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
//**Controller  for verify OTP */
exports.verifyOTP = async (req, res) => {
  const { otp, mobile } = req.body;
  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp === otp) {
      // OTP is valid
      user.otp = null;
      user.isVerified = true;
      await user.save();

      // Send welcome email to the user
      sendWelcomeEmail(user.email, user.name);

      return res
        .status(200)
        .json({ message: "OTP verified successfully! You Can Login Now" });
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
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: username }, { mobile: username }],
    });
    if (!user) {
      return res.status(401).json({ message: "Incorrect username" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Account not verified. Please verify your account first.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user);

    // Send welcome email to the user
    sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      message: `${user.name}, You have successfully Logged In Happy Shopping`,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

//**Controller For Update Profile */
exports.profileUpdate = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user wants to update their name
    if (name) {
      user.name = name;
    }

    // Check if the user wants to update their email
    if (email) {
      user.email = email;
    }

    await user.save();
    let message = "";

    if (name && email) {
      message = "You have updated your name and email.";
    } else if (name) {
      message = "You have updated your name.";
    } else if (email) {
      message = "You have updated your email.";
    }

    return res.status(200).json({ message: message || "No changes made" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

//**Controller For Change Password */
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
    passwordChangeEmail(user.email, user.name);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
};
//**Controller For Forgot Password */
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { mobile } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate OTP and send
    const otp = await sendOtp(mobile, user.otpRegenerationCount);
    // Update user's OTP and regeneration count
    user.resetOTP = otp;
    user.otpRegenerationCount += 1;
    await user.save();
    return res.status(200).json({ message: "OTP sent to your mobile" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};
//**Controller For Reset Password */
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { mobile, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (parseInt(user.resetOTP) !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};
//**Controller to get user profile */
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return user profile details
    return res.status(200).json({
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};
