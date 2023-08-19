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

const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");

//**Route for get all categories */
router.get("/categories", getAllCategories);
//**Route to add a category */
router.post(
  "/categories",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addCategory
);
//**Route to add a SubCategory */
router.post(
  "/categories/:categoryId/subcategories",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addSubCategory
);
//**Route to delete a Category */
router.delete(
  "/categories/:categoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteCategory
);
//**Route to delete a Sub Category */
router.delete(
  "/categories/:categoryId/subcategories/:subcategoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteSubCategory
);

module.exports = router;
