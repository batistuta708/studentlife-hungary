// Eliminates try/catch boilerplate in every controller — any rejected promise or thrown
// error inside an async handler is forwarded to Express's error-handling middleware.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
