// routes/couponRoutes.js
const express = require("express");
const router = express.Router();

const {
  addCouponCode,
  applyCouponCode,
  deleteCouponCode,
  editCouponCode,
} = require("../controllers/couponController");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");

// Route to add a new coupon
router.post(
  "/add-coupon",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addCouponCode
);
// Route to apply a coupon to the user's cart
router.post(
  "/apply-coupon",
  authenticationMiddleware.isAuthenticated,
  applyCouponCode
);
router.patch(
    "/edit-coupon/:couponId",
    authenticationMiddleware.isAuthenticated,
    authorizationMiddleware.isAdmin,
    editCouponCode
)
router.delete(
  "/delete-coupon/:couponId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteCouponCode
);

module.exports = router;
