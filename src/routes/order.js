//** routes/couponRoutes.js*/
const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/authenticationMiddleware")
const { placeOrder, updateOrder } = require("../controllers/orderController");

router.post(
  "/place/order",
  authenticationMiddleware.isAuthenticated,
  placeOrder
);
router.put(
  "/verify/payment",
  authenticationMiddleware.isAuthenticated,
  updateOrder
);
module.exports = router;

