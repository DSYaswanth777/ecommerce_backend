//**Express Initilaztion */
const express = require("express");
const {
  addProductToCart,
  getUserCart,
} = require("../controllers/cartController");
//**Express Router initilaztion */
const router = express.Router();
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");

router.post(
  "/user/:userId/cart/add",
  addProductToCart,
  authenticationMiddleware.isAuthenticated
);
router.get("/user/:userId/cartcart", getUserCart, authenticationMiddleware.isAuthenticated);
module.exports = router;
