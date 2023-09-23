const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, min:6, max:25},
  productPrice: { type: Number, required: true },
  productImages: [{ type: String, required: true }],
  productInfo: { type: String, required: true, min:10 },
  productColorOptions: [{ type: String }],
  productStock:{type:Number,required:true, min:1, max:350},
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory", // Reference to your Subcategory model
    required: true,
  },
  

});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
