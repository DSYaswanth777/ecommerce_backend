//**Express Initilzation */
const express = require("express");
//**Router Initilaztion */
const router = express.Router();
//**Importing Controllers */
const {
  getUserWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
} = require("../controllers/wishlistController");
//**Importing Middlewares */
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Route to get all wishlisted products*/
router.get(
  "/wishlist",
  authenticationMiddleware.isAuthenticated,
  getUserWishlist
);
//**Route to add a product to wishlist */
router.post(
  "/wishlist/add",
  authenticationMiddleware.isAuthenticated,
  addProductToWishlist
);
//**Route to remove a product to wishlist */
router.delete(
  "/wishlist/delete/:wishlistItemId",
  authenticationMiddleware.isAuthenticated,
  removeProductFromWishlist
);
module.exports = router;
