//**Express Initilzation */
const express = require("express");
//**Importing Product Controllers */
const {
  addProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
  getFilteredProducts,
  searchProductsByName,
} = require("../controllers/productController");
//**Router Initilaztion */
const router = express.Router();
//**Importing Middleware */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Add product 
router.post(
  "/addproduct",
  addProduct,
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
);
//**Get all products 
router.get("/products", getAllProducts);
//**Edit Product */
router.put(
  "/products/:productId",
  editProduct,
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin
);
//**Delete Product */
router.delete(
  "/products/delete/:productId",
  deleteProduct,
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
);
//**Filter products based on category */
router.get(
    "/filterproducts",
    getFilteredProducts
)
//**Search for a product based on product name */
router.get(
    "/productsearch",
    searchProductsByName
)
module.exports = router;
