//**Mongoose Import */
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

//**Subcategory Schema */
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true ,min:6,max:25},
});
//**Category Schema */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, min:6,max:25},
  subcategories: [subcategorySchema],
});

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = { Category, Subcategory };
