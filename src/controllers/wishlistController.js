const User = require("../models/User");
const Product = require("../models/productModel");

//**Add Product to Wishlist Controller */
exports.addProductToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the user's wishlist
    const existingWishlistItem = user.wishlist.find((item) =>
      item.product.equals(productId)
    );

    if (!existingWishlistItem) {
      // Remove the product from the cart if it exists there
      const cartItem = user.cart.find((item) => item.product.equals(productId))
      if (cartItem) {
        user.cart.pull(cartItem._id);
      }

      // Add the product to the wishlist
      if (user.wishlist.length < 25) {
        user.wishlist.push({ product: productId });
        await user.save();
        res.status(201).json({ message: "Product added to wishlist" })
      } else {
        res.status(400).json({ message: "Wishlist is full" });
      }
    } else {
      res.status(400).json({ message: "Product already in wishlist" });
    }
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding product to wishlist" });
  }
};
//**Get User Wishlist Controller */
exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlistItems: user.wishlist });
  } catch (error) {
    console.error("Error fetching user's wishlist:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user's wishlist" });
  }
};
//**Remove Product from Wishlist */
exports.removeProductFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const {wishlistItemId} = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the wishlist item with the given ID
    const wishlistItemIndex = user.wishlist.findIndex((item) =>
      item._id.equals(wishlistItemId)
    );

    if (wishlistItemIndex !== -1) {
      // Remove the wishlist item at the specified index
      user.wishlist.splice(wishlistItemIndex, 1);
      await user.save();

      const updatedUser = await User.findById(userId).populate(
        "wishlist.product"
      );

      res.status(200).json({
        message: "Product removed from wishlist",
        updatedWishlist: updatedUser.wishlist,
      });
    } else {
      res.status(404).json({ message: "Wishlist item not found" });
    }
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({
      message: "An error occurred while removing product from wishlist",
    });
  }
};
