//**User Model Import */
const User = require("../models/User");
//** Importing bcrypt for password hashing */
const bcrypt = require("bcryptjs");
//**Importing passport for user authentication */
const passport = require("../passport/passport");
//**Middleware for user Authentication */
const authenticationMiddleware = require("../middlewares/authenticationMiddleware")
//**Controller For Signup */
exports.signup = async (req, res) => {
  const { name, age, mobile, email, password, confirmPassword } = req.body;
  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if a user with the same mobile number or email already exists
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User with the same mobile number or email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      age,
      mobile,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User registration failed", error: error.message });
  }
};
//**Controller For Login */
exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const { role } = req.user;
      if (role === "admin") {
        return res.status(200).json({ message: "Admin logged in", role });
      } else if (role === "customer") {
        return res.status(200).json({ message: "Customer logged in", role });
      } else {
        return res.status(200).json({ message: "User logged in", role });
      }
    });
  })(req, res, next);
};
//**Controller For UpdateProfile */
exports.profileUpdate = [
  authenticationMiddleware.isAuthenticated,
  async (req, res) => {
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }
  const { name, age, mobile, email } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the updated email already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email; // Only update if email is provided and not the same
    }

    // Check if the updated mobile number already exists
    if (mobile && mobile !== user.mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res
          .status(400)
          .json({ message: "Mobile number already in use" });
      }
      user.mobile = mobile; // Only update if mobile is provided and not the same
    }

    // Update user's profile if name or age is provided
    if (name) {
      user.name = name;
    }
    if (age) {
      user.age = age;
    }

    const updatedUser = await user.save();
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
}];
//**Controller For Change Password */
exports.changePassword = [
  authenticationMiddleware.isAuthenticated,
  async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
}];
//**Controller for Lagout */
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error logging out", error: err.message });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};
