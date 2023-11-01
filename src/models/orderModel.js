// models/Order.js

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    fullName: String,
    mobileNumber: String,
    streetAddress: String,
    landmark: String,
    townCity: String,
    pincode: String,
    state: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "Successful", "failed"],
    default: "pending",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now, // Set a default value to the current date and time
  },
  razorpayOrderID: String,
  orderID: String,
});

module.exports = mongoose.model("Order", OrderSchema);
