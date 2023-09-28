//**Mongoose Import */
const mongoose = require('mongoose')
//**Coupon Code Schema */
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true, 
    required: true,
  },
  discountedAmount: {
    type: Number,
    required: true,
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
});

module.exports = mongoose.model('Coupon', couponSchema);
