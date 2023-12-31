//** routes/couponRoutes.js*/ 
const express = require("express");
const router = express.Router();
//**Controller Import */
const {
  addCouponCode,
  applyCouponCode,
  deleteCouponCode,
  editCouponCode,
  getAllCoupons,
  searchCoupons,
  removeCoupon,
} = require("../controllers/couponController");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");

//**  Route to add a new coupon*/
router.post(
  "/admin/add/coupon",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  addCouponCode
);
//** Route to apply a coupon to the user's cart*/ 
router.post(
  "/apply/coupon",
  authenticationMiddleware.isAuthenticated,
  applyCouponCode
);
//**Route to Edit Coupon */
router.patch(
    "/admin/coupon/edit/:couponId",
    authenticationMiddleware.isAuthenticated,
    authorizationMiddleware.isAdmin,
    editCouponCode
)
//**Route to Delete Coupon * /
router.delete(
  "/admin/delete/coupon/:couponId",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  deleteCouponCode
);
//**Route to Get Coupon * /

router.get(
  "/admin/coupons",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  getAllCoupons
)
//**Route to Search Coupon * /
router.get(
  "/admin/coupons/search",
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  searchCoupons
)
 router.delete(
  "/coupon/remove",
  authenticationMiddleware.isAuthenticated,
  removeCoupon
 )
module.exports = router;
