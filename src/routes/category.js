//**Express Initilaztion */
const express = require("express");
//**Router Initilaztion */
const router = express.Router();
//**Controller Imports */
const {
  getAllCategories,
  addCategory,
  addSubCategory,
  deleteCategory,
  deleteSubCategory,
} = require("../controllers/categoriesController");

//** Middleware to check if the user is authenticated */ 
const isAdminAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
};
//**Route for get all categories */
router.get("/categories", getAllCategories);
//**Route to add a category */
router.post("/categories", addCategory, isAdminAuthenticated);
//**Route to add a SubCategory */
router.post(
  "/categories/:categoryId/subcategories",
  addSubCategory,
  isAdminAuthenticated
);
//**Route to delete a Category */
router.delete("/categories/:categoryId", isAdminAuthenticated, deleteCategory);
//**Route to delete a Sub Category */
router.delete(
  "/categories/:categoryId/subcategories/:subcategoryId",
  deleteSubCategory,
  isAdminAuthenticated
);

module.exports = router;
