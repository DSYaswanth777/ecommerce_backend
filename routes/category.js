const express = require("express");
const router = express.Router();
const { Category, Subcategory } = require("../models/categoryModel");
const mongoose = require("mongoose");

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({}, "name subcategories");
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories" });
  }
});

router.post("/categories", async (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    try {
      const newCategory = await Category.create({ name: req.body.name });
      res.status(201).json(newCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while creating the category" });
    }
  } else {
    res.status(403).json({ message: "Access denied" });
  }
});

router.post("/categories/:categoryId/subcategories", async (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
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
  } else {
    res.status(403).json({ message: "Access denied" });
  }
});

router.delete("/categories/:categoryId", async (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
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
  } else {
    res.status(403).json({ message: "Access denied" });
  }
});

router.delete('/categories/:categoryId/subcategories/:subcategoryId', async (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      try {
        const categoryId = req.params.categoryId;
        const subcategoryId = req.params.subcategoryId;
  
        // Validate the categoryId and subcategoryId format
        if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subcategoryId)) {
          return res.status(400).json({ message: 'Invalid category or subcategory ID format' });
        }
  
        // Find the category using its ID
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
  
        // Find the index of the subcategory to delete
        const subcategoryIndex = category.subcategories.findIndex(sub => sub._id.equals(subcategoryId));
        if (subcategoryIndex === -1) {
          return res.status(404).json({ message: 'Subcategory not found in the category' });
        }
  
        // Remove the subcategory from the subcategories array
        category.subcategories.splice(subcategoryIndex, 1);
        await category.save();
  
        res.status(200).json({ message: 'Subcategory deleted successfully' });
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ message: 'An error occurred while deleting the subcategory' });
      }
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  });
  
  
  
  

module.exports = router;
