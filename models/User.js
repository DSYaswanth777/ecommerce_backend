const mongoose = require('mongoose');

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
    enum: ['admin', 'customer'], // Use 'enum' to restrict role values to these options
    default: 'customer', // Set default role to 'customer'
  },

});

module.exports = mongoose.model('User', userSchema);
