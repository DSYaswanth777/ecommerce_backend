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
const productRoutes = require("./src/routes/product");
const cartRoutes = require("./src/routes/cart");
const wishlistRoutes = require("./src/routes/wishlist");
const couponRoutes = require("./src/routes/coupon");
const helmet = require("helmet");
dotenv.config();
const helmetCsp = require("helmet-csp");
const rateLimit = require("express-rate-limit");
const app = express();

//** Middleware */
app.use(express.json());
app.use(helmet()); // Set security headers
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(
  helmetCsp({
    directives: {
      defaultSrc: ["'self'"], // Allow resources to be loaded from the same origin by default
      scriptSrc: ["'self'", "trusted-scripts.com"], // Define trusted sources for scripts
      // Add other CSP directives as needed
    },
  })
);
app.use(limiter); // Rate limiting
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
//**  Set up session and flash middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.get("/", (res) => {
  res.send("Hey this is my API running 🥳");
});
// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
connectToDatabase(); // Call the database connection function

// Routes
app.use("/api/v1", authRoutes); // Signup and Login
app.use("/api/v1", customersRoutes); // Customers Route
app.use("/api/v1", categoryRoutes); // Category Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", wishlistRoutes);
app.use("/api/v1", couponRoutes);

// Start the server
const PORT = process.env.PORT || 5173;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Error handling for app.listen
server.on("error", (error) => {
  console.error("Server error:", error);
});
