const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, min:6, max:25},
  productPrice: { type: Number, required: true },
  productImages: [{ type: String, required: true }],
  productInfo: { type: String, required: true, min:10 },
  productStock:{type:Number,required:true, min:0, max:350},
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
