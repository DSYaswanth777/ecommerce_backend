//**Express Initilzation */
const express = require("express");
//**Importing Product Controllers */
const {
  addProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
  searchProductsByName,
  viewProduct,
  getRecentProducts,
  sortProducts,
  getProductsByCategoryAndSubcategory,
  getProductsBySubcategories,
} = require("../controllers/productController");
//**Router Initilaztion */
const router = express.Router();
//**Importing Middleware */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Add product
router.post(
  "/admin/add/product",
  addProduct,
  authorizationMiddleware.isAdmin,
  authenticationMiddleware.isAuthenticated
);
//**Get all products
router.get("/products", getAllProducts);
//**Edit Product */
router.patch(
  "/admin/products/edit/:productId",
  editProduct,
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin
);
//**Delete Product */
router.delete(
  "/admin/products/delete/:productId",
  deleteProduct,
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin
);
//**Filter products based on category */
router.get("/products/sort", sortProducts);
//**Search for a product based on product name */
router.get("/products/search", searchProductsByName);
router.get("/products/recentproducts", getRecentProducts);
//**View Product API */
router.get("/products/viewproduct/:productId", viewProduct);
router.get("/products/filters", getProductsBySubcategories)
module.exports = router;
