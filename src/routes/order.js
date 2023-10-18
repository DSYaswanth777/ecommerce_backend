//** routes/couponRoutes.js*/
const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
const {
  placeOrder,
  updateOrder,
  getAllUserOrders,
  getAllOrdersForAdmin,
} = require("../controllers/orderController");

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
router.get(
  "/user/orders",
  authenticationMiddleware.isAuthenticated,
  getAllUserOrders
);
router.get(
  "/admin/orders",
  authenticationMiddleware.isAuthenticated,
  getAllOrdersForAdmin
);
module.exports = router;
