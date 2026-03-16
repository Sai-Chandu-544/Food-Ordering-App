const express = require("express");
const app = express();

require("dotenv").config();

const port = process.env.PORT || 5000;

// Import packages FIRST
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

// Import routes
const user_router = require("./routes/user_router");
const admin_router = require("./routes/admin_router");

// Database
const Database = require("./config/mongoose_connection.js");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Clerk Authentication Middleware
app.use(ClerkExpressWithAuth());

// Connect database
Database();

// Routes
app.use("/user", user_router);
app.use("/admin", admin_router);

// Start server
app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});