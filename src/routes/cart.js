const express = require("express");
const {
  addProductToCart,
  getUserCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  removeProductFromCart
} = require("../controllers/cartController");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");

const router = express.Router();

// Add a product to the cart
router.post(
  "/user/:userId/cart/add",
  authenticationMiddleware.isAuthenticated,
  addProductToCart
);

// Get user's cart
router.get("/user/:userId/cart", authenticationMiddleware.isAuthenticated, getUserCart);

// Increase cart item quantity
router.put(
  "/user/:userId/cart/increase/:cartItemId",
  authenticationMiddleware.isAuthenticated,
  increaseCartItemQuantity
);

// Decrease cart item quantity
router.put(
  "/user/:userId/cart/decrease/:cartItemId",
  authenticationMiddleware.isAuthenticated,
  decreaseCartItemQuantity
);

router.delete(
  "/user/:userId/cart/:cartItemId/remove",
  authenticationMiddleware.isAuthenticated,
  removeProductFromCart
)
module.exports = router;
