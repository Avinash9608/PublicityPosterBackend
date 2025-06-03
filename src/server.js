const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const fs = require("fs");
const path = require("path");
// Connect to database
connectDB();

const server = app.listen(PORT, () => {
  console.log("Server running on port 5000");
  console.log("Static folder:", path.join(__dirname, "uploads"));
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
