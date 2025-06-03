// src/utils/errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ErrorResponse;
