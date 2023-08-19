//**Express Initilaztion */
const express = require("express");
//**Express Router initilaztion */
const router = express.Router();
//** Importing Passport for authentaction */
const passport = require("../passport/passport");
//**Importing Controllers*/
const { signup, login, profileUpdate, changePassword, logout } = require("../controllers/authController");
//** Initialize Passport middleware
router.use(passport.initialize());
router.use(passport.session());

//**Signup Route
router.post("/signup", signup);
//**  Login route
router.get("/logout",logout);
//**Logout route */
router.post("/login",login);
//** Update profile route
router.put("/update-profile", profileUpdate );
//**  Change password route
router.put("/change-password", changePassword);

module.exports = router;
