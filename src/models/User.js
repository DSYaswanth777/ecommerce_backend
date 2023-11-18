//**Mongoose import */
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

//**Importing Validators */
const { nameValidator } = require("../utilities/validators");
//** UserSchema */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    validate: nameValidator,
    required: true,
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
    minlength: 6,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer",
  },
  otp: {
    type: Number,
    required: false,
  },
  resetOTP: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false, // New field to indicate if the user is verified
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
      },
      quantity: {
        type: Number,
        default: 1, // Default quantity when adding to cart
      },
      totalFee: {
        type: Number,
        default: 0,
      },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
      },
    },
  ],
  appliedCoupon: {
    code: String, // Store the applied coupon code
    discountAmount: Number, // Store the discount amount
  },
});

module.exports = mongoose.model("User", userSchema);
