  const express = require("express");
  const dotenv = require("dotenv");
  const passport = require("passport");
  const session = require("express-session");
  const flash = require("connect-flash");
  const connectToDatabase = require("./src/config/database");
  const cors = require("cors"); 
  //**Route Import */
  const authRoutes = require("./src/routes/auth");
  const customersRoutes = require("./src/routes/customers");
  const categoryRoutes = require("./src/routes/category");
  const productRoutes = require("./src/routes/product")
  const cartRoutes = require("./src/routes/cart")
  const wishlistRoutes = require("./src/routes/wishlist")
  const couponRoutes = require("./src/routes/coupon")
  dotenv.config();

  const app = express();

  // Middleware
  app.use(express.json());

  const corsOptions = {
    origin: "http://localhost:5173", // Replace with the actual origin of your frontend
    credentials: true, // Enable credentials (cookies, authorization headers)
  };
  
  app.use(cors(corsOptions));
  // Set up session and flash middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(flash());
  app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳')
  })
  // Initialize Passport
  app.use(passport.initialize());

  // Connect to MongoDB
  connectToDatabase(); // Call the database connection function

  // Routes
  app.use("/", authRoutes); // Signup and Login
  app.use("/", customersRoutes); // Customers Route
  app.use("/", categoryRoutes); // Category Routes
  app.use("/", productRoutes);
  app.use("/",cartRoutes);
  app.use("/",wishlistRoutes)
  app.use("/",couponRoutes)

  // Start the server
  const PORT = process.env.PORT || 5173;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // Error handling for app.listen
  server.on("error", (error) => {
    console.error("Server error:", error);
  });
