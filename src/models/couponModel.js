// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true, // Ensure uniqueness of coupon codes
    required: true,
  },
  discountedAmount: {
    type: Number,
    required: true,
  },
  maxUses: {
    type: Number, // Maximum number of times the coupon can be used
    default: null, // Null means no usage limit
  },
  expirationDate: {
    type: Date, // Date when the coupon expires
    default: null, // Null means no expiration date
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
