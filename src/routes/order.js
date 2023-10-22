//** routes/couponRoutes.js*/
const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");

const {
  placeOrder,
  updateOrder,
  getAllUserOrders,
  getAllOrdersForAdmin,
  getOrderDetails,
  shippingAddress,
  getOrdersByDate,
  getOrdersByID,
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
  "/user/orders/orderdetail/:orderID",
  authenticationMiddleware.isAuthenticated,
  getOrderDetails
);
router.get(
  "/admin/orders",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  getAllOrdersForAdmin
);
router.get(
  "/generate/shipping/address/:orderID",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  shippingAddress
)
router.get(
  "/user/orders/filter",
  authenticationMiddleware.isAuthenticated,
  getOrdersByDate
)
router.get(
  "/user/orders/filter/order",
  authenticationMiddleware.isAuthenticated,
  getOrdersByID
)
module.exports = router;
