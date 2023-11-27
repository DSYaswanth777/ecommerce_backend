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
        _id: mongoose.Schema.Types.ObjectId,
        productName: String,
        productPrice: Number,
        productImages: [String],
        productInfo: String,
        productStock: Number,
        subcategoryId: mongoose.Schema.Types.ObjectId,
        categoryId: mongoose.Schema.Types.ObjectId,
        createdAt: Date,
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
  razorpay_payment_id:String,
  couponDiscount: {
    type: Number,
  },
  deliveryFee:{
    type:Number
  },
  orderID: String,
  courierName: {
    type: String,
    default: null,
  },
  trackingID: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
