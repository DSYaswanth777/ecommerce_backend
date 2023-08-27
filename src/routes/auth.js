//**Express Initilaztion */
const express = require("express");
//**Express Router initilaztion */
const router = express.Router();
//**Importing Middleware */
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Importing Controllers*/
const {
  signup,
  login,
  profileUpdate,
  changePassword,
  verifyOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
//**Signup Route
router.post("/signup", signup);
//**  Login route
router.post("/login", login);
//**Verify OTP route */
router.post("/verify-otp", verifyOTP);
//** Update profile route */
router.put(
  "/update-profile",
  authenticationMiddleware.isAuthenticated,
  profileUpdate
);
//** Change password route */
router.put(
  "/change-password",
  authenticationMiddleware.isAuthenticated,
  changePassword
);
//**forgot Password */
router.post("/forgot-password", forgotPassword);
//**Reset Password */
router.post("/reset-password", resetPassword);
module.exports = router;
