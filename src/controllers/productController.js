const Product = require("../models/productModel"); // Import the Product model
const multer = require("multer"); // For handling file uploads
const upload = multer({ dest: "uploads/" }); // Define a destination for uploaded files
//**Importing Middlewares */
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const authenticationMiddleware = require("../middlewares/authenticationMiddleware");
//** Add Product controller
exports.addProduct = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  upload.array("productImages", 5), // Assuming a maximum of 5 images can be uploaded
  async (req, res) => {
    try {
      const {
        productName,
        productMRP,
        productDiscount,
        productInfo,
        productColorOptions,
        subcategoryId,
      } = req.body;

      const productPrice = productMRP - productDiscount;

      const productImages = req.files.map((file) => file.path);

      const newProduct = await Product.create({
        productName,
        productMRP,
        productDiscount,
        productPrice,
        productImages,
        productInfo,
        productColorOptions,
        subcategoryId,
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error adding product:", error);
      res
        .status(500)
        .json({ message: "An error occurred while adding the product" });
    }
  },
];
//**  Get all products controller
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
};
//**  Edit Product controller
exports.editProduct = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  async (req, res) => {
    try {
      const productId = req.params.productId;
      const updatedFields = req.body;

      // You can check if the product exists in the database
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Apply updates to the existing product object
      for (const [key, value] of Object.entries(updatedFields)) {
        existingProduct[key] = value;
      }

      // Calculate updated productPrice if applicable
      if (
        updatedFields.productMRP !== undefined ||
        updatedFields.productDiscount !== undefined
      ) {
        existingProduct.productPrice =
          (updatedFields.productMRP || existingProduct.productMRP) -
          (updatedFields.productDiscount || existingProduct.productDiscount);
      }

      // Save the updated product
      const updatedProduct = await existingProduct.save();

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error editing product:", error);
      res
        .status(500)
        .json({ message: "An error occurred while editing the product" });
    }
  },
];
//**  Delete Product controller
exports.deleteProduct = [
  authenticationMiddleware.isAuthenticated,
  authorizationMiddleware.isAdmin,
  async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(
        req.params.productId
      );

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting the product" });
    }
  },
];
//** Filter based on category
exports.getFilteredProducts = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.query;

    let filter = {};

    if (categoryId) {
      filter.subcategoryId = subcategoryId;
    }

    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching filtered products" });
  }
};
//**Search product based on name */
exports.searchProductsByName = async (req, res) => {
  try {
    const { productName } = req.query;

    //**  Perform a case-insensitive search for products by name
    const products = await Product.find({
      productName: { $regex: productName, $options: "i" },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products by name:", error);
    res
      .status(500)
      .json({ message: "An error occurred while searching products by name" });
  }
};
