//**Express Initilaztion */
const express = require("express");
//**Express Router initilaztion */
const router = express.Router();
//** Importing Passport for authentaction */
const passport = require("../passport/passport");
//**Importing Controllers*/
const { signup, login, profileUpdate, changePassword, logout, verifyOTP, forgotPassword, resetPassword } = require("../controllers/authController");
//** Initialize Passport middleware
router.use(passport.initialize());
router.use(passport.session());
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");

//**Signup Route
router.post("/signup", signup);
//**  Login route
router.post("/login",login);
//**Verify OTP route */
router.post("/verify-otp", verifyOTP)
//** Update profile route
router.put("/update-profile", passport.authenticate('jwt', { session: false }), profileUpdate);
//**  Change password route
router.put('/change-password', passport.authenticate('jwt', { session: false }), changePassword);

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

module.exports = router;
