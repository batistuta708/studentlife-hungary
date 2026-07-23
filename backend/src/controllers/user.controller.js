const { User } = require("../models");
const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query).filter().search(false).sort().limitFields().paginate();
  const [docs, total] = await Promise.all([features.query, User.countDocuments(features.query.getFilter())]);

  new ApiResponse(200, docs, "Fetched successfully", {
    page: features.pagination.page,
    limit: features.pagination.limit,
    total,
    totalPages: Math.ceil(total / features.pagination.limit),
  }).send(res);
});

exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  new ApiResponse(200, user).send(res);
});

exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["student", "editor", "admin"].includes(role)) {
    throw ApiError.badRequest("Invalid role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  new ApiResponse(200, user, "Role updated").send(res);
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  user.isActive = !user.isActive;
  await user.save();
  new ApiResponse(200, user, `User ${user.isActive ? "activated" : "deactivated"}`).send(res);
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  new ApiResponse(200, null, "User deleted").send(res);
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user).send(res);
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const disallowed = ["password", "role", "email", "isActive", "refreshTokens"];
  disallowed.forEach((field) => delete req.body[field]);

  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
  new ApiResponse(200, user, "Profile updated").send(res);
});
