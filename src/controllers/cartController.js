//**Importing User Model */
const User = require("../models/User");
//**Importing Product Model */
const Product = require("../models/productModel");
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
  
      if (cartItem) {
        // If the product is already in the cart, increase the quantity by one
        cartItem.quantity += 1;
      } else {
        // If the product is not in the cart, add it with quantity one
        user.cart.push({ product: productId, quantity: 1 });
      }
  
      await user.save();
  
      res.status(201).json({ message: "Product added to cart" });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).json({ message: "An error occurred while adding product to cart" });
    }
  };
//**Increase cart Item Quantity controller */
exports.increaseCartItemQuantity = async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemId = req.params.cartItemId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const cartItem = user.cart.id(cartItemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
  
      cartItem.quantity += 1;
      await user.save();
  
      res.status(200).json({ message: "Cart item quantity increased" });
    } catch (error) {
      console.error("Error increasing cart item quantity:", error);
      res.status(500).json({ message: "An error occurred while increasing cart item quantity" });
    }
  };
//**Decrease cart Item Quantity controller */
exports.decreaseCartItemQuantity = async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemId = req.params.cartItemId;
  
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
        await user.save();
        res.status(200).json({ message: "Cart item removed" });
      }
    } catch (error) {
      console.error("Error decreasing cart item quantity:", error);
      res.status(500).json({ message: "An error occurred while decreasing cart item quantity" });
    }
  };
//**Get User Cart controller */
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let totalFee = 0;
    user.cart.forEach((cartItem) => {
      const product = cartItem.product;
      const itemTotal = product.productPrice * cartItem.quantity;
      totalFee += itemTotal;
    });

    // Apply delivery charge logic
    let deliveryCharge = 50;
    if (user.cart.length >= 4 || user.cart.some((item) => item.quantity >= 4)) {
      deliveryCharge = 0;
    }

    totalFee += deliveryCharge;

    res.status(200).json({ cartItems: user.cart, totalFee });
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
    const cartItemId = req.params.cartItemId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the cart item from the user's cart
    user.cart.pull(cartItemId);
    await user.save();

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred while removing product from cart" });
  }
};
