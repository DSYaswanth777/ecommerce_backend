//**Importing User Model */
const User = require("../models/User");
//**Importing Product Model */
const Product = require("../models/productModel");
const { calculateTotalAmount } = require("../utilities/amountCalculations");
//**addProduct to cart controller */
exports.addProductToCart = async (req, res) => {
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

    // Check if the product is already in the user's cart
    const cartItem = user.cart.find((item) => item.product.equals(productId));
    const productDetails = {
      _id: productId,
      productName: product.productName,
      productPrice: product.productPrice,
      productImages: product.productImages,
      productInfo: product.productInfo,
      productStock: product.productStock,
      subcategoryId: product.subcategoryId,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
    };
    if (cartItem) {
      // If the product is already in the cart, increase the quantity by one
      cartItem.quantity += 1;
    } else {
      // If the product is not in the cart, add it with quantity one
      user.cart.push({ product: productDetails, quantity: 1 });
    }

    const { totalFee, actualPrice, totalDeliveryFee } =
      calculateTotalAmount(user);

    // Update totalFee and deliveryFee in user document
    user.totalFee = totalFee;
    user.totalDeliveryFee = totalDeliveryFee;
    await user.save();

    res.status(201).json({ message: "Product added to cart" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding product to cart" });
  }
};
//**Increase cart Item Quantity controller */
exports.increaseCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the cart item by its ID
    const cartItem = user.cart.id(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Check if there is enough stock to increase the quantity
    if (cartItem.quantity < cartItem.product.productStock) {
      cartItem.quantity += 1;
      const { totalFee, totalDeliveryFee } = calculateTotalAmount(user);

      // Update totalFee and totalDeliveryFee in user document
      user.totalFee = totalFee;
      user.totalDeliveryFee = totalDeliveryFee;

      await user.save();
      res.status(200).json({ message: "Cart item quantity increased" });
    } else {
      res
        .status(400)
        .json({ message: "Not enough stock to increase quantity" });
    }
  } catch (error) {
    console.error("Error increasing cart item quantity:", error);
    res.status(500).json({
      message: "An error occurred while increasing cart item quantity",
    });
  }
};
//**Decrease cart Item Quantity controller */
exports.decreaseCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.id(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await user.save();
      res.status(200).json({ message: "Cart item quantity decreased" });
    } else {
      // Remove the cart item if quantity becomes zero
      user.cart.pull(cartItemId);
      const { totalFee, totalDeliveryFee } = calculateTotalAmount(user);

      // Update totalFee and totalDeliveryFee in user document
      user.totalFee = totalFee;
      user.totalDeliveryFee = totalDeliveryFee;

      await user.save();
      res.status(200).json({ message: "Cart item removed" });
    }
  } catch (error) {
    console.error("Error decreasing cart item quantity:", error);
    res.status(500).json({
      message: "An error occurred while decreasing cart item quantity",
    });
  }
};
//**Get User Cart controller */
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { totalFee, actualPrice, totalDeliveryFee } =
      calculateTotalAmount(user);

    if (user.cart.length === 0) {
      user.appliedCoupon = null;
      await user.save();
      return res.status(200).json({
        cartItems: [],
        totalFee: 0,
        actualPrice: 0,
        deliveryCharge: 0,
        appliedCoupon: null,
      });
    }

    user.cart.totalFee = totalFee; // Store totalFee in the cart item

    res.status(200).json({
      cartItems: user.cart,
      totalFee,
      actualPrice,
      deliveryCharge: totalDeliveryFee,
      appliedCoupon: user.appliedCoupon || null,
    });
  } catch (error) {
    console.error("Error fetching user's cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user's cart" });
  }
};
//**Remove Product from Cart */
exports.removeProductFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the cart item from the user's cart
    user.cart.pull(cartItemId);
    const { totalFee, totalDeliveryFee } = calculateTotalAmount(user);

    // Update totalFee and totalDeliveryFee in user document
    user.totalFee = totalFee;
    user.totalDeliveryFee = totalDeliveryFee;

    await user.save();

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred while removing product from cart" });
  }
};
