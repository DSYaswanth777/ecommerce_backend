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
  forSpecificUser: {
    type: Boolean,
    default: false,
  },
  // Add a field to store specific user IDs for whom the coupon is applicable
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});


module.exports = mongoose.model('Coupon', couponSchema);
