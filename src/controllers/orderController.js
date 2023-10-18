// controllers/orderController.js

const User = require("../models/User");
const orderModel = require("../models/orderModel")
function generateOrderID() {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const uniqueChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let uniqueString = "";

  // Generate a 6-character random string
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * uniqueChars.length);
    uniqueString += uniqueChars[randomIndex];
  }

  return `ODID${formattedDate}${uniqueString}`;
}
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let totalAmount = 0;
    user.cart.forEach((cartItem) => {
      const product = cartItem.product;
      if (product) {
        totalAmount += product.productPrice * cartItem.quantity;
      }
    });
    // Generate a unique order ID
    const orderID = generateOrderID();

    const order = new orderModel({
      user: userId,
      cartItems: user.cart,
      shippingAddress,
      totalAmount,
      paymentStatus: "pending",
      orderID: orderID,
    });
    await order.save();

    // Add the order to the user's orders array
    user.orders.push(order);

    // Clear the user's cart
    user.cart = [];

    await user.save();

    res.status(201).json({ message: "Order placed successfully", orderID });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "An error occurred while placing the order" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    // const { orderId } = req.params;
    const { orderID,paymentStatus } = req.body;

    const order = await orderModel.findOne({orderID:orderID})
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    order.paymentStatus = paymentStatus;
    await order.save();

    res
      .status(200)
      .json({ message: "Order payment status updated successfully" });
  } catch (error) {
    console.error("Error updating order payment status:", error);
    res.status(500).json({
      message: "An error occurred while updating the order payment status",
    });
  }
};
