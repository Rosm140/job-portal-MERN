const { sendResponse } = require("../utils/helpers");

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for development
  console.error(`Error: ${err.message}` || err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return sendResponse(res, 404, false, "Resource not found");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return sendResponse(res, 400, false, "Duplicate field value entered");
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = { errorHandler, notFound };