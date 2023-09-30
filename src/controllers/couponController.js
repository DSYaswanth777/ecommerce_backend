const User = require("../models/User");
const Coupon = require("../models/couponModel");

//** Controller to add a new coupon */
exports.addCouponCode = async (req, res) => {
  try {
    const { code, discountedAmount, maxUses, expirationDate } = req.body;
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" })
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
//**Controller to apply a coupon to the user's cart */
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
//**Controller to delete a coupon to the user's cart */
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
//**Controller to edit a coupon to the user's cart */
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
    coupon.code = code || coupon.code; 
    coupon.discountedAmount = discountedAmount || coupon.discountedAmount;
    coupon.maxUses = maxUses || coupon.maxUses;
    coupon.expirationDate = expirationDate || coupon.expirationDate;
    await coupon.save();
    res.status(200).json({ message: "Coupon updated successfully" },);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the coupon" });
  }
};
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "An error occurred while fetching coupons" });
  }
};
exports.searchCoupons = async (req, res) => {
  try {
    const { couponCode } = req.query;
    
    // Search for coupons that match the provided code
    const coupons = await Coupon.find({ code: { $regex: couponCode, $options: "i" } });
    
    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error searching for coupons:", error);
    res.status(500).json({ message: "An error occurred while searching for coupons" });
  }
};

