const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  let error = err;

  // Normalize known Mongoose errors into ApiError so the response shape stays consistent.
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = ApiError.conflict(`Duplicate value for field: ${field}`);
  } else if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest("Validation failed", errors);
  } else if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token");
  } else if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired");
  } else if (!(err instanceof ApiError)) {
    error = ApiError.internal(process.env.NODE_ENV === "production" ? "Something went wrong" : err.message);
  }

  if (!error.isOperational) {
    logger.error(err.stack || err.message);
  } else if (error.statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${error.statusCode} - ${error.message} - ${req.method} ${req.originalUrl}`);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
