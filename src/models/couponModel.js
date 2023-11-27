//**Mongoose Import */
const mongoose = require("mongoose");
//**Coupon Code Schema */
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  discountedAmount: {
    type: Number,
    // Custom validation based on discountType
    validate: {
      validator: function(value) {
        // If discountType is product, then discountedAmount is required
        return this.discountType !== 'product' || (typeof value === 'number');
      },
      message: 'Discounted amount is required for product-type coupons.'
    }
  },
  discountType: {
    type: String,
    enum: ["product", "delivery"],
    required: true,
    default: "product", // default value, assuming most coupons are for products
  },
  maxUses: {
    type: Number,
    default: null,
    required: true,
  },
  expirationDate: {
    type: Date,
    default: null,
    required: true,
  },
  forSpecificUser: {
    type: Boolean,
    default: false,
  },
  targetUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Coupon", couponSchema);
