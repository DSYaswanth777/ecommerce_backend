//**Mongoose Import */
const mongoose = require('mongoose');
//**Subcategory Schema */
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});
//**Category Schema */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [subcategorySchema],
});

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = { Category, Subcategory };
