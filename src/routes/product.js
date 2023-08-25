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
const passport = require("../passport/passport")
router.use(passport.initialize());
router.use(passport.session());
//**Importing Middleware */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Add product 
router.post(
  "/addproduct",
  addProduct,
  passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
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
