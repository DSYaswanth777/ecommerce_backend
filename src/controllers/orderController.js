// controllers/orderController.js

const User = require("../models/User");
const orderModel = require("../models/orderModel");
const Product = require("../models/productModel");
const path = require("path");

const PDFDocument = require("pdfkit");
function generateOrderID() {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const uniqueChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueString = "";

  // Generate a 6-character random string
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * uniqueChars.length);
    uniqueString += uniqueChars[randomIndex];
  }

  return `ODID${formattedDate}${uniqueString}`;
}
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let totalAmount = 0;
    user.cart.forEach((cartItem) => {
      const product = cartItem.product;
      if (product) {
        totalAmount += product.productPrice * cartItem.quantity + 50;
      }
    });
    const orderID = generateOrderID();

    // Get the current date and time
    const orderDate = new Date();
    const order = new orderModel({
      user: userId,
      cartItems: user.cart,
      shippingAddress: shippingAddress,
      totalAmount,
      paymentStatus: "pending",
      orderID: orderID,
      orderDate: orderDate,
    });

    await order.save();

    // Add the order to the user's orders array
    user.orders.push(order);

    // Clear the user's cart
    user.cart = [];

    await user.save();

    res.status(201).json({ message: "Order placed successfully", orderID });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "An error occurred while placing the order" });
  }
};
exports.updateOrder = async (req, res) => {
  try {
    const { orderID, paymentStatus } = req.body;
    const order = await orderModel.findOne({ orderID: orderID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the payment status is "successful"
    if (paymentStatus === "Successful") {
      // Update the order payment status
      order.paymentStatus = paymentStatus;
      await order.save();

      // Update product stock for each item in the order
      for (const item of order.cartItems) {
        const product = await Product.findById(item.product);

        if (product) {
          // Ensure there is enough stock to fulfill the order
          if (product.productStock >= item.quantity) {
            product.productStock -= item.quantity;
            await product.save();
          } else {
            // Handle cases where there's not enough stock
            return res.status(400).json({
              message: "Not enough stock to fulfill the order",
              product: product.productName,
            });
          }
        } else {
          // Handle cases where the product is not found
          return res.status(404).json({
            message: "Product not found",
            productId: item.product,
          });
        }
      }
    } else {
      // Handle cases where the payment status is not "successful"
      return res.status(400).json({
        message: "Payment status is not successful",
      });
    }

    res
      .status(200)
      .json({ message: "Order payment status and stock updated successfully" });
  } catch (error) {
    console.error("Error updating order payment status:", error);
    res.status(500).json({
      message: "An error occurred while updating the order payment status",
    });
  }
};
exports.getAllUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "orders",
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
      .find() // No exclusion of the 'user' field
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
