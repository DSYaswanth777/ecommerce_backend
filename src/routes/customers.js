//**Express Initilzation */
const express = require("express");
//**Router Initilaztion */
const router = express.Router();
//**Importing Controllers */
const {
  getCustomers,
  searchCustomers,
} = require("../controllers/customerController");
//**Importing Middlewares */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Route to get all Customers */
router.get(
  "/customers",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  getCustomers
);
//**Route for search a customer */
router.get(
  "/search/customer",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  searchCustomers
);

module.exports = router;
