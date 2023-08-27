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
  getUserProfile,
} = require("../controllers/authController");
//**Signup Route
router.post("/signup", signup);
//**  Login route
router.post("/login", login);
//**Verify OTP route */
router.post("/verify-otp", verifyOTP);
//** Update profile route */
router.put(
  "/profile/update",
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
//**Profile */
router.get("/profile",
authenticationMiddleware.isAuthenticated,
getUserProfile
)
module.exports = router;
