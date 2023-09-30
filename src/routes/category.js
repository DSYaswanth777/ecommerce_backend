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
  searchCategories,
  editCategory,
  editSubCategory,
} = require("../controllers/categoriesController");
//**Importing Middleware */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Route for get all categories */
router.get("/categories", getAllCategories);
//**Route to add a category */
router.post(
  "/admin/add/category",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addCategory
);
router.put(
  "/admin/edit/category/:categoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  editCategory
)
router.put(
  "/admin/edit/category/:categoryId/subcategory/:subcategoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  editSubCategory
)
//**Route to add a SubCategory */
router.post(
  "/admin/add/categories/:categoryId/subcategory",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addSubCategory
);
//**Route to delete a Category */
router.delete(
  "/admin/delete/categories/:categoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteCategory
);
//**Route to delete a Sub Category */
router.delete(
  "/admin/delete/categories/:categoryId/subcategories/:subcategoryId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteSubCategory
);
//**Route to search a category */
router.get("/categories/search", searchCategories)

module.exports = router;
