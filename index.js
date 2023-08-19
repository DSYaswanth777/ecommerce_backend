const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const connectToDatabase = require("./src/config/database");
//**Route Import */
const authRoutes = require("./src/routes/auth");
const customersRoutes = require("./src/routes/customers");
const categoryRoutes = require("./src/routes/category");
const productRoutes = require("./src/routes/product")
const cartRoutes = require("./src/routes/cart")

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Set up session and flash middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
connectToDatabase(); // Call the database connection function

// Routes
app.use("/", authRoutes); // Signup and Login
app.use("/", customersRoutes); // Customers Route
app.use("/", categoryRoutes); // Category Routes
app.use("/", productRoutes);
app.use("/",cartRoutes)
// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Error handling for app.listen
server.on("error", (error) => {
  console.error("Server error:", error);
});
