//**Express Initilzation */
const express = require("express");
//**Router Initilaztion */
const router = express.Router();
//**Importing Controllers */
const {
  getCustomers, searchCustomers,
} = require("../controllers/customerController");
//**Importing Middlewares */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//**Route to get all Customers */
router.get(
  "/admin/customers",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  getCustomers
);
//**Route to search for a customer */
router.get(
 "/admin/search/customer",
 authorizationMiddleware.isAdmin,
 authenticationMiddleware.isAuthenticated,
 searchCustomers
)
module.exports = router;
