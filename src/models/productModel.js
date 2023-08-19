const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productMRP: { type: Number, required: true },
  productDiscount: { type: Number, required: true },
  productPrice: { type: Number, required: true },
  productImages: [{ type: String, required: true }],
  productInfo: { type: String, required: true },
  productColorOptions: [{ type: String }],
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory", // Reference to your Subcategory model
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
