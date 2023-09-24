//**  Product model Import */
const Product = require("../models/productModel"); 
//**Multer for handling File Uploads */ 
const multer = require("multer"); 
//** Destination for uploaded files */
const upload = multer({ dest: "uploads/" }); 
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
//** Add Product controller */
exports.addProduct = [
  upload.array("productImages", 5), // Assuming a maximum of 5 images can be uploaded
  async (req, res) => {
    try {
      const {
        productName,
        productPrice,
        productInfo,
        subcategoryId,
        productStock
      } = req.body;
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        })
      );
      const newProduct = await Product.create({
        productName,
        productPrice,
        productImages:uploadedImages,
        productInfo,
        productColorOptions,
        subcategoryId,
        productStock
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const count = await Product.countDocuments();
    const totalPages = Math.ceil(count / limit);

    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
};

//**  Edit Product controller
exports.editProduct = [
  async (req, res) => {
    try {
      const productId = req.params.productId;
      const updatedFields = req.body;
      // You can check if the product exists in the database
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Delete existing images from Cloudinary
      for (const imageUrl of existingProduct.productImages) {
        const public_id = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(public_id);
      }

      // Upload and replace with new images in Cloudinary
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        })
      );

      // Update the product details
      for (const [key, value] of Object.entries(updatedFields)) {
        existingProduct[key] = value;
      }

      // Update productImages with new Cloudinary URLs
      existingProduct.productImages = uploadedImages;

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
  async (req, res) => {
    try {
      const productId = req.params.productId;

      // Fetch the product from the database
      const deletedProduct = await Product.findById(productId);

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete images from Cloudinary
      for (const imageUrl of deletedProduct.productImages) {
        // Extract the public_id from the Cloudinary URL
        const public_id = imageUrl.split('/').pop().split('.')[0];
        
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(public_id);
      }

      // Delete the product from MongoDB
      await Product.findByIdAndDelete(productId);

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
