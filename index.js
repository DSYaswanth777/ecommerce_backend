const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
const passport = require("passport");
const authRoutes = require("./routes/auth");
const customersRoutes = require("./routes/customers")
const session = require('express-session');
const flash = require('connect-flash');
app.use(passport.initialize());
app.use(express.json());
app.use(cors());

//** Set up session and flash middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
// Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


//Siginup and Login
app.use("/", authRoutes);
app.use("/",customersRoutes)
// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
