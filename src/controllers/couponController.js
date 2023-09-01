// routes/couponRoutes.js
const User = require("../models/User");
const Coupon = require("../models/couponModel");

// Controller to add a new coupon
exports.addCouponCode = async (req, res) => {
  try {
    const { code, discountedAmount, maxUses, expirationDate } = req.body;
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    const newCoupon = new Coupon({
      code,
      discountedAmount,
      maxUses,
      expirationDate,
    });
    await newCoupon.save();
    res.status(201).json({ message: "Coupon code added successfully" });
  } catch (error) {
    console.error("Error adding coupon code:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding the coupon code" });
  }
};
// Controller to apply a coupon to the user's cart
exports.applyCouponCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon code not found" });
    }

    user.appliedCoupon = {
      code: coupon.code,
      discountAmount: coupon.discountedAmount,
    };
    await user.save();

    res.status(200).json({ message: "Coupon applied successfully" });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while applying the coupon" });
  }
};
exports.deleteCouponCode = async (req, res) => {
  try {
    const { couponId } = req.params;
    // Check if the coupon exists
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    // Delete the coupon
    await Coupon.findByIdAndDelete(couponId);

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the coupon" });
  }
};
exports.editCouponCode = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { code, discountedAmount, maxUses, expirationDate } = req.body;
    // Check if the coupon exists
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    // Update the coupon's information
    coupon.code = code || coupon.code; // Use existing value if not provided in the request
    coupon.discountedAmount = discountedAmount || coupon.discountedAmount;
    coupon.maxUses = maxUses || coupon.maxUses;
    coupon.expirationDate = expirationDate || coupon.expirationDate;
    await coupon.save();
    res.status(200).json({ message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the coupon" });
  }
};
