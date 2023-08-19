//**Mongoose import */
const mongoose = require('mongoose');

//** UserSchema */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: true,
    min: 12,
    max: 98,
  },
  mobile: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/, // Indian mobile number regex
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[\w-]+(\.[\w-]+)*@([a-z\d-]+\.){1,2}[a-z]{2,4}$/,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'customer'], 
    default: 'customer', 
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
      },
      quantity: {
        type: Number,
        default: 1, // Default quantity when adding to cart
      },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
