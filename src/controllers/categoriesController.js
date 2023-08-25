//**Mongoose Import */
const mongoose = require("mongoose");
//**Importing category Model */
const { Category, Subcategory } = require("../models/categoryModel");
//**Importing Middlewares */
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");

//**Get all categories controller */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, "name subcategories");
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories" });
  }
};
//**Add Category controller */
exports.addCategory = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
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
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
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
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
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
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
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