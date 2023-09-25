//**Mongoose Import */
const mongoose = require("mongoose");
//**Importing category Model */
const { Category, Subcategory } = require("../models/categoryModel");

//**Get all categories controller */
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const count = await Category.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const categories = await Category.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      categories,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories" });
  }
};
//**Add Category controller */
exports.addCategory = [
  async (req, res) => {
    try {
      const newCategory = await Category.create({ name: req.body.name });
      res.status(201).json(newCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while creating the category" });
    }
  }
];
//**Add Sub Category controller */
exports.addSubCategory = [
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const newSubcategory = await Subcategory.create({ name: req.body.name });
      category.subcategories.push(newSubcategory);
      await category.save();
      res.status(201).json(newSubcategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while creating the subcategory" });
    }
  }
];
//**Delete Category controller */
exports.deleteCategory = [
  async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while deleting the category" });
    }
  }
];
//**Delete Sub Category controller */
exports.deleteSubCategory = [
  async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const subcategoryId = req.params.subcategoryId;

      if (
        !mongoose.Types.ObjectId.isValid(categoryId) ||
        !mongoose.Types.ObjectId.isValid(subcategoryId)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid category or subcategory ID format" });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subcategoryIndex = category.subcategories.findIndex((sub) =>
        sub._id.equals(subcategoryId)
      );
      if (subcategoryIndex === -1) {
        return res
          .status(404)
          .json({ message: "Subcategory not found in the category" });
      }

      category.subcategories.splice(subcategoryIndex, 1);
      await category.save();

      res.status(200).json({ message: "Subcategory deleted successfully" });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting the subcategory" });
    }
  }
];
//**  Search Categories controller */
exports.searchCategories = async (req, res) => {
  try {
    // Get the search query from the request parameters
    const query = req.query.q;
    // Define a regex pattern to search for the query in category names
    const regexPattern = new RegExp(query, "i"); // "i" makes the search case-insensitive
    // Use Mongoose to search for categories whose names match the query
    const categories = await Category.find({ name: regexPattern });
    res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Error searching categories:", error);
    res.status(500).json({ message: "An error occurred while searching categories" });
  }
};
