//**Intializing express */
const express = require("express");
//**Intializing Router */
const router = express.Router();
//**Importing Controllers */
const {
  addProductToCart,
  getUserCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  removeProductFromCart,
} = require("../controllers/cartController");
//**Importing Middleware */
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//** Add a product to the cart */
router.post(
  "/user/:userId/cart/add",
  authenticationMiddleware.isAuthenticated,
  addProductToCart
);
//** Get user's cart */
router.get(
  "/user/:userId/cart",
  authenticationMiddleware.isAuthenticated,
  getUserCart
);
//** Increase cart item quantity */
router.put(
  "/user/:userId/cart/increase/:cartItemId",
  authenticationMiddleware.isAuthenticated,
  increaseCartItemQuantity
);
//**Decrease cart item quantity */
router.put(
  "/user/:userId/cart/decrease/:cartItemId",
  authenticationMiddleware.isAuthenticated,
  decreaseCartItemQuantity
);
//**Remove from cart
router.delete(
  "/user/:userId/cart/:cartItemId/remove",
  authenticationMiddleware.isAuthenticated,
  removeProductFromCart
);
module.exports = router;
