const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const router = express.Router();
// Initialize Passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Configure Passport.js to use LocalStrategy
passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      const adminCredentials = [
        { username: "admin1", password: "admin123" },
        { username: "admin2", password: "admin456" },
      ];

      const admin = adminCredentials.find((cred) => cred.username === username);
      if (admin && admin.password === password) {
        return done(null, { username: admin.username, role: "admin" });
      }

      try {
        const user = await User.findOne({
          $or: [{ email: username }, { mobile: username }],
        });

        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          role: "customer",
        }); // Set role to 'customer'
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
// Signup route
router.post("/signup", async (req, res) => {
  const { name, age, mobile, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if a user with the same mobile number or email already exists
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({
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
});
// Login route
router.post("/login", (req, res, next) => {
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
});
// Update profile route
router.put("/update-profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

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
    }

    // Check if the updated mobile number already exists
    if (mobile && mobile !== user.mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({ message: "Mobile number already in use" });
      }
    }

    // Update user's profile
    user.name = name;
    user.age = age;
    user.mobile = mobile;
    user.email = email;

    const updatedUser = await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});
// Change password route
router.put("/change-password", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

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
});

module.exports = router;
