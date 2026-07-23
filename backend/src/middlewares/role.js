const ApiError = require("../utils/ApiError");

// Usage: router.delete('/:id', protect, restrictTo('admin'), controller.remove)
const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized("Authentication required"));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden("You do not have permission to perform this action"));
  }
  next();
};

// Allows the resource owner OR an admin — e.g. a student editing their own job listing,
// or an admin editing anyone's. `getOwnerId` extracts the owner ObjectId from the loaded doc.
const restrictToOwnerOrRoles = (getOwnerId, ...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized("Authentication required"));
  const ownerId = getOwnerId(req);
  const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
  const hasRole = allowedRoles.includes(req.user.role);
  if (!isOwner && !hasRole) {
    return next(ApiError.forbidden("You do not have permission to perform this action"));
  }
  next();
};

module.exports = { restrictTo, restrictToOwnerOrRoles };
