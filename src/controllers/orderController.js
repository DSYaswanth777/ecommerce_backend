const User = require("../models/User");
const orderModel = require("../models/orderModel");
const Product = require("../models/productModel");
const path = require("path");
const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const { generateOrderID } = require("../utilities/generateOrderId");
const { calculateTotalAmount } = require("../utilities/amountCalculations");
const couponModel = require("../models/couponModel");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let { totalDeliveryFee, totalAmount, couponDiscount } =
      calculateTotalAmount(user);

    const orderID = generateOrderID();

    const instance = new Razorpay({
      key_id: process.env.YOUR_RAZORPAY_KEY_ID,
      key_secret: process.env.YOUR_RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: totalAmount * 100, // Amount should be in paise (INR)
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await createRazorpayOrder(instance, options);

    const orderDate = new Date();
    const newOrder = new orderModel({
      user: userId,
      cartItems: user.cart,
      shippingAddress: shippingAddress,
      totalAmount,
      paymentStatus: "pending", // Update payment status to "PENDING"
      orderID: orderID,
      orderDate: orderDate,
      razorpayOrderID: order.id,
      deliveryFee: totalDeliveryFee,
      couponDiscount: couponDiscount,
    });

    await newOrder.save();

    // Update the user's orders array and cart atomically
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, __v: user.__v }, // Find the user by ID and version
      {
        $push: { orders: newOrder }, // Add the order to the orders array
        $set: { cart: [] }, // Clear the user's cart
      },
      { new: true } // Return the modified document
    );

    if (!updatedUser) {
      // If the document wasn't updated, handle the error
      return res
        .status(500)
        .json({ message: "Failed to update user document" });
    }

    res.status(201).json({
      message: "Order placed successfully",
      razorpayOrderID: order.id,
      orderID,
      deliveryFee: totalDeliveryFee,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "An error occurred while placing the order" });
  }
};
async function createRazorpayOrder(instance, options) {
  return new Promise((resolve, reject) => {
    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error("Razorpay order creation error:", error);
        reject(error);
      } else {
        resolve(order);
      }
    });
  });
}
exports.updateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderID,
    } = req.body;
    // Retrieve the order from the database based on the orderID
    const order = await orderModel.findOne({ orderID });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the payment status is "pending" before proceeding
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Order payment is not pending" });
    }

    // Verify the Razorpay signature
    const expectedSign = crypto
      .createHmac("sha256", process.env.YOUR_RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }

    // Process each item in the order
    for (const item of order.cartItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          productId: item.product,
        });
      }

      // Check if there is enough stock to fulfill the order
      if (product.productStock - item.quantity < 0) {
        return res.status(400).json({
          message: "Not enough stock to fulfill the order",
          product: product.productName,
        });
      }

      // Deduct the quantity from product stock
      product.productStock -= item.quantity;
      await product.save();
    }
    order.razorpay_payment_id = razorpay_payment_id;
    // Update the order's payment status
    order.paymentStatus = "Successful";
    await order.save();

    // Fetch the user's applied coupon
    const user = await User.findById(order.user);

    if (user.appliedCoupon && user.appliedCoupon.code) {
      const couponCode = user.appliedCoupon.code;

      // Find the coupon in the database
      const coupon = await couponModel.findOne({ code: couponCode });

      if (coupon) {
        // Check if the coupon has a maximum usage limit
        if (coupon.maxUses !== undefined && coupon.maxUses !== null) {
          // Update the max usage of the coupon
          coupon.maxUses -= 1;
          // Save the updated coupon
          await coupon.save();
        }
      }
    }

    return res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getAllUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "orders",
      options: { sort: { orderDate: -1 } },
      populate: {
        path: "cartItems.product",
        select: "productName productPrice productImages subcategoryId ", // Add other product fields you need
        populate: {
          path: "subcategoryId", // Assuming it's the name of the subcategory reference in your product model
          select: "name", // Adjust the field name as per your subcategory model
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = user.orders;

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user orders" });
  }
};
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate({
        path: "cartItems.product",
        select: "productName productPrice productImages subcategoryId ",
        populate: {
          path: "subcategoryId",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "shippingAddress",
      });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    res.status(500).json({
      message: "An error occurred while fetching all orders for admin",
    });
  }
};
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params; // Get the orderID from the URL parameter

    // Find the order based on the orderID
    const order = await orderModel.findOne({ orderID }).populate({
      path: "cartItems.product",
      select: "productName productPrice productImages subcategoryId ",
      populate: {
        path: "subcategoryId",
        select: "name",
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching order details" });
  }
};
exports.shippingAddress = async (req, res) => {
  {
    try {
      const { orderID } = req.params;
      const order = await orderModel.findOne({ orderID }).populate({
        path: "cartItems.product",
        select: "productName subcategoryId productPrice", // Include the fields you need
        populate: {
          path: "subcategoryId",
          select: "name",
        },
      });

      if (!order || order.paymentStatus !== "Successful") {
        return res
          .status(404)
          .json({ message: "Order not found or not successful" });
      }

      const user = await orderModel.findOne({ orderID });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create a PDF document
      const pdfDoc = new PDFDocument();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="order-${orderID}.pdf`
      );

      // Pipe the PDF document to the response
      pdfDoc.pipe(res);
      pdfDoc.dash(5, { space: 2 }); // Adjust the numbers for your preferred dot size and space

      // Add a rectangle as a border around the content
      pdfDoc.rect(40, 25, 520, 350).stroke(); // Adjust the coordinates and dimensions as needed

      // Reset the dash setting to the default
      pdfDoc.undash();
      const pageWidth = pdfDoc.page.width;

      // Calculate the X-coordinate to position the image at the right end
      const imageWidth = 160; // Adjust as needed
      const xCoordinate = pageWidth - imageWidth - 65; // 60 is for some margin

      // Add the PNG image to the PDF at the right end
      const imagePath = path.join(__dirname, "brand_logo.png"); // Path to your PNG image
      pdfDoc.image(imagePath, xCoordinate, 19, {
        width: imageWidth,
        height: 80,
      });

      // Sender's Information
      pdfDoc.moveDown(0.5);
      pdfDoc.moveDown(0.5);
      pdfDoc.moveDown(0.5);
      pdfDoc.font("Helvetica");
      pdfDoc
        .fontSize(15)
        .text("From:", { continued: false })
        .font("Helvetica-Bold");
      pdfDoc.text("GSR Handlooms", { continued: false }).font("Helvetica");
      pdfDoc.text(
        "Address: Jakka Vari Street, Perala, Chirala, Andhra Pradesh"
      );
      pdfDoc.text("Pincode: 523157");
      pdfDoc.moveDown(0.8);
      pdfDoc.moveDown(0.5);
      pdfDoc.font("Helvetica");
      pdfDoc.fontSize(15).text(`To:`);
      pdfDoc.fontSize(14).text(`Order ID: ${orderID}`).font("Helvetica-Bold");
      pdfDoc.fontSize(14).text(`Order Date: ${order.orderDate}`);
      pdfDoc.moveDown(0.5);
      pdfDoc.moveDown(0.5);
      pdfDoc.fontSize(16).text("ADDRESS:").font("Helvetica-Bold");
      pdfDoc
        .fontSize(14)
        .text(`Name: ${user.shippingAddress.fullName}`)
        .font("Helvetica");
      pdfDoc
        .fontSize(14)
        .text(`Address: ${user.shippingAddress.streetAddress}`)
        .font("Helvetica");
      pdfDoc
        .fontSize(14)
        .text(`City: ${user.shippingAddress.townCity}`)
        .font("Helvetica");
      pdfDoc
        .fontSize(14)
        .text(`State: ${user.shippingAddress.state}`)
        .font("Helvetica");
      pdfDoc
        .fontSize(14)
        .text(`PIN Code: ${user.shippingAddress.pincode}`)
        .font("Helvetica");
      pdfDoc.end();

      res.status(200);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res
        .status(500)
        .json({ message: "An error occurred while generating the PDF" });
    }
  }
};
exports.getOrdersByDate = async (req, res) => {
  try {
    const { orderDate } = req.query;

    if (!orderDate) {
      return res
        .status(400)
        .json({ message: "Order date parameter is required" });
    }

    // Parse the orderDate as a Date object
    const date = new Date(orderDate);
    // Create a date range for the entire day
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    // Define a filter based on the order date
    const filter = {
      orderDate: {
        $gte: date,
        $lt: nextDay,
      },
    };

    // Query the orders using the filter
    const orders = await orderModel
      .find(filter)
      .populate({
        path: "cartItems.product",
        select: "productName productImages subcategoryId ",
        populate: {
          path: "subcategoryId",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "shippingAddress",
      });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders by date:", error);
    res.status(500).json({
      message: "An error occurred while fetching orders by date",
    });
  }
};
exports.getOrdersByID = async (req, res) => {
  try {
    const { orderID } = req.query;

    if (!orderID) {
      return res
        .status(400)
        .json({ message: "Order ID parameter is required" });
    }

    // Define a filter based on the order ID
    const filter = {
      orderID: orderID,
    };

    // Query the orders using the filter
    const orders = await orderModel
      .find(filter)
      .populate({
        path: "cartItems.product",
        select: "productName subcategoryId",
        populate: {
          path: "subcategoryId",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "shippingAddress",
      });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders by ID:", error);
    res.status(500).json({
      message: "An error occurred while fetching orders by ID",
    });
  }
};
exports.editOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { courierName, trackingID } = req.body;
    console.log(orderID,courierName,trackingID)
    // Find the order based on the orderID
    const order = await orderModel.findOne({ orderID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Update the order with the new courier name, tracking ID, and payment status
    order.courierName = courierName;
    order.trackingID = trackingID;
    // // If paymentStatus is provided in the request body, update it
    // if (paymentStatus) {
    //   order.paymentStatus = paymentStatus;
    // }
    // Save the updated order
    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
