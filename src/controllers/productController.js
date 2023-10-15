//**  Product model Import */
const { Subcategory, Category } = require("../models/categoryModel");
const Product = require("../models/productModel");
//**Multer for handling File Uploads */
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//** */ Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "your-folder-name", // Set your desired folder name in Cloudinary
  allowedFormats: ["jpg", "jpeg", "png", "gif"],
  transformation: [{ width: 500, height: 500, crop: "limit" }],
});

//** */ Configure multer to use Cloudinary storage
const upload = multer({ storage: storage });

//** Add Product controller */
exports.addProduct = [
  upload.array("productImages", 5),
  async (req, res) => {
    try {
      const {
        productName,
        productPrice,
        productInfo,
        subcategoryId,
        productStock,
        categoryId,
      } = req.body;

      // Check if the subcategory with the specified subcategoryId exists
      const subcategory = await Subcategory.findById(subcategoryId);

      if (!subcategory) {
        return res.status(400).json({ message: "Invalid subcategoryId" });
      }

      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        })
      );
      const subcategoryInfo = await Subcategory.findById(subcategoryId);
      const categoryInfo = await Category.findById(categoryId);

      const newProduct = await Product.create({
        productName,
        productPrice,
        productImages: uploadedImages,
        productInfo,
        subcategoryId,
        productStock,
        categoryId,
        categoryName: categoryInfo.name,
        subcategoryName: subcategoryInfo.name,
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
//** */ Get all products controller
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
};
// **Edit Product controller**
exports.editProduct = [
  async (req, res) => {
    try {
      const { productId } = req.params;

      // Fetch the product from the database
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update the product with the new values from the request body
      product.productName = req.body.productName;
      product.productPrice = req.body.productPrice;
      product.productInfo = req.body.productInfo;
      product.subcategoryId = req.body.subcategoryId;
      product.productStock = req.body.productStock;

      // Save the updated product to the database
      await product.save();

      // Send the updated product back to the client
      res.status(200).json(product);
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
        const public_id = imageUrl.split("/").pop().split(".")[0];

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
exports.sortProducts = async (req, res) => {
  try {
    const { sortBy, minPrice, maxPrice } = req.query;

    let sort = {};
    if (sortBy === "lowtohigh") {
      sort = { productPrice: 1 };
    } else if (sortBy === "hightolow") {
      sort = { productPrice: -1 };
    } else if (sortBy === "featured") {
      sort = { createdAt: -1 }
    }

    const priceFilter = {};

    if (minPrice) {
      priceFilter.productPrice = { $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      priceFilter.productPrice = { ...priceFilter.productPrice, $lte: parseFloat(maxPrice) };
    }

    // Combine the sorting and price filter criteria
    const filterCriteria = {
      ...priceFilter,
    };
    const products = await Product.find(filterCriteria)
      .sort(sort)
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching filtered products" });
  }
};
//** Get products starting from the date of the last added product
exports.getRecentProducts = async (req, res) => {
  try {
    // Find the date of the last added product
    const lastAddedProduct = await Product.findOne().sort({ createdAt: -1 });

    if (!lastAddedProduct) {
      return res.status(404).json({ message: "No products found" });
    }

    // Calculate the start date based on the last added product's date
    const startDate = new Date(lastAddedProduct.createdAt);

    // Calculate the end date by subtracting 1 day from the start date
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() - 1);

    // Find products within the date range
    const recentProducts = await Product.find({
      createdAt: { $gte: endDate, $lte: startDate },
    })
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");

    res.status(200).json(recentProducts);
  } catch (error) {
    console.error("Error fetching recent products:", error);
    res.status(500).json({
      message: "An error occurred while fetching recent products",
    });
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
//**View Product API */
exports.viewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch the product from the database by its ID
    const product = await Product.findById(productId).populate({
      path: "subcategoryId",
      select: "name", // Select the subcategoryName field
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Include the subcategoryName in the product object
    const productWithSubcategoryName = {
      ...product.toObject(),
      subcategory: product.subcategoryId.subcategoryName,
    };

    res.status(200).json(productWithSubcategoryName);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the product" });
  }
};
exports.getProductsBySubcategories = async (req, res) => {
  try {
    // Get the subcategory IDs from the query parameters as a comma-separated string
    const subcategoryIds = req.query.subcategoryIds;

    // Split the comma-separated string into an array
    const subcategoryIdArray = subcategoryIds.split(',');

    // Fetch products that belong to the specified subcategories
    const products = await Product.find({
      subcategoryId: { $in: subcategoryIdArray },
    })
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by subcategories:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching products by subcategories",
      });
  }
};


