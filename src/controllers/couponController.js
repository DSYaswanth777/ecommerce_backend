const User = require("../models/User");
const Coupon = require("../models/couponModel");
const moment = require("moment-timezone");

//** Controller to add a new coupon */
exports.addCouponCode = async (req, res) => {
  try {
    const {
      code,
      discountedAmount,
      maxUses,
      expirationDate,
      forSpecificUser,
      targetUsers,
    } = req.body;

    if (forSpecificUser && (!targetUsers || targetUsers.length === 0)) {
      return res.status(400).json({
        message: 'Target users must be specified for a specific user coupon',
      });
    }

    // If the coupon is for specific users, check if the provided user IDs are valid
    if (forSpecificUser) {
      const invalidUserIds = await User.find({ _id: { $in: targetUsers } }).countDocuments({ _id: { $nin: targetUsers } });
      if (invalidUserIds > 0) {
        return res.status(400).json({ message: 'Invalid user IDs provided' });
      }
    }

    const expirationDateIST = moment(expirationDate)
      .tz('Asia/Kolkata')
      .toDate();

    const existingCoupon = await Coupon.findOne({ code });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code,
      discountedAmount,
      maxUses,
      expirationDate: expirationDateIST,
      forSpecificUser,
      targetUsers: forSpecificUser ? targetUsers : [],
    });

    await newCoupon.save();

    res.status(201).json({ message: 'Coupon code added successfully' });
  } catch (error) {
    console.error('Error adding coupon code:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while adding the coupon code' });
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
    if (coupon.forSpecificUser && !coupon.targetUsers.includes(userId)) {
      return res.status(403).json({ message: 'Coupon not applicable to this user' });
    }
    // Check if the coupon has reached its maximum usage limit
    if (coupon.maxUses === 0) {
      return res
        .status(403)
        .json({ message: "Coupon has reached its maximum usage limit" });
    }

    if (coupon.expirationDate) {
      const currentDateTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      const couponExpirationDateTime = new Date(
        coupon.expirationDate
      ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      // Compare the current date and time with the coupon's expiration date and time
      if (couponExpirationDateTime < currentDateTime) {
        return res.status(403).json({ message: "Coupon has expired/not applicable to this user" });
      }
    }

    user.appliedCoupon = {
      code: coupon.code,
      discountAmount: coupon.discountedAmount,
    };

    // Increment the used count of the coupon
    coupon.usedCount += 1;
    await coupon.save();

    await user.save();

    // Modify the response to include the applied coupon information
    res.status(200).json({
      message: "Coupon applied successfully",
      appliedCoupon: {
        code: coupon.code,
        discountAmount: coupon.discountedAmount,
      },
    });
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
    const { code, discountedAmount, maxUses, expirationDate, forSpecificUser, targetUsers } = req.body;
    // Check if the coupon exists
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // If the coupon is changing from specific to all users or vice versa
    if (coupon.forSpecificUser !== forSpecificUser) {
      // If changing to specific user coupon, check if the provided user IDs are valid
      if (forSpecificUser) {
        const invalidUserIds = await User.find({ _id: { $in: targetUsers } }).countDocuments({ _id: { $nin: targetUsers } });
        if (invalidUserIds > 0) {
          return res.status(400).json({ message: 'Invalid user IDs provided' });
        }
      }
      // Update the coupon's information
      coupon.forSpecificUser = forSpecificUser;
      coupon.targetUsers = forSpecificUser ? targetUsers : [];
    }

    // Update other fields of the coupon
    coupon.code = code || coupon.code;
    coupon.discountedAmount = discountedAmount || coupon.discountedAmount;
    coupon.maxUses = maxUses || coupon.maxUses;

    // Convert expirationDate to Indian Standard Time
    coupon.expirationDate = expirationDate
      ? moment(expirationDate).tz("Asia/Kolkata").toDate()
      : coupon.expirationDate;

    await coupon.save();
    res.status(200).json({ message: "Coupon updated successfully" });
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
    // Convert expirationDate to Indian Standard Time for all coupons
    const couponsWithIST = coupons.map((coupon) => {
      return {
        ...coupon.toObject(),
        expirationDate: moment(coupon.expirationDate)
          .tz("Asia/Kolkata")
          .format(),
      };
    });

    res.status(200).json(couponsWithIST);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching coupons" });
  }
};
exports.searchCoupons = async (req, res) => {
  try {
    const { couponCode } = req.query;

    // Search for coupons that match the provided code
    const coupons = await Coupon.find({
      code: { $regex: couponCode, $options: "i" },
    });

    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error searching for coupons:", error);
    res
      .status(500)
      .json({ message: "An error occurred while searching for coupons" });
  }
};
//**Controller to remove a coupon from the user's cart */
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the applied coupon from the user
    user.appliedCoupon = null;

    await user.save();

    res.status(200).json({ message: "Coupon removed successfully" });
  } catch (error) {
    console.error("Error removing coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while removing the coupon" });
  }
};
