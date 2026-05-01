const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for the given user ID
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Verify a JWT token and return the decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Build a standardized API response object
 */
const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    ...data,
  });
};

module.exports = { generateToken, verifyToken, sendResponse };
