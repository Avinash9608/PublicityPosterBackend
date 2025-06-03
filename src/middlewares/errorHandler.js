// const errorHandler = (err, req, res, next) => {
//   console.error(err.stack);

//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal Server Error";

//   res.status(statusCode).json({
//     success: false,
//     message,
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// };

// module.exports = errorHandler;
// src/middleware/errorHandler.js
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for developer
  console.error(`${err.name}:`.red, err.message);
  console.error(err.stack);

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Not authorized";
    error = new ErrorResponse(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired, please login again";
    error = new ErrorResponse(message, 401);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    errors: error.errors, // Include validation errors if they exist
  });
};

module.exports = errorHandler;
