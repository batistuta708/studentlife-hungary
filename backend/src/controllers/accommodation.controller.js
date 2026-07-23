const { Accommodation } = require("../models");
const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("./handlerFactory");

const base = factory(Accommodation, { populate: [{ path: "location.nearestUniversity", select: "name slug" }] });

exports.getAll = asyncHandler(async (req, res) => {
  const filterQuery = { ...req.query };
  if (!req.user || !["editor", "admin"].includes(req.user.role)) {
    filterQuery.status = "approved";
  }

  const features = new ApiFeatures(Accommodation.find(), filterQuery)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();
  const query = features.query.populate({ path: "location.nearestUniversity", select: "name slug" });
  const [docs, total] = await Promise.all([query, Accommodation.countDocuments(features.query.getFilter())]);

  new ApiResponse(200, docs, "Fetched successfully", {
    page: features.pagination.page,
    limit: features.pagination.limit,
    total,
    totalPages: Math.ceil(total / features.pagination.limit),
  }).send(res);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const listing = await Accommodation.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  ).populate({ path: "location.nearestUniversity", select: "name slug" });
  if (!listing) throw ApiError.notFound("Accommodation not found");
  new ApiResponse(200, listing).send(res);
});

exports.create = asyncHandler(async (req, res) => {
  const listing = await Accommodation.create({ ...req.body, listedBy: req.user._id });
  new ApiResponse(201, listing, "Listing submitted — pending admin approval").send(res);
});

exports.update = asyncHandler(async (req, res) => {
  const listing = await Accommodation.findById(req.params.id);
  if (!listing) throw ApiError.notFound("Accommodation not found");

  const isOwner = listing.listedBy.toString() === req.user._id.toString();
  if (!isOwner && !["editor", "admin"].includes(req.user.role)) {
    throw ApiError.forbidden("You do not have permission to edit this listing");
  }

  Object.assign(listing, req.body);
  await listing.save();
  new ApiResponse(200, listing, "Listing updated").send(res);
});

exports.remove = base.deleteOne;

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "rejected", "rented", "expired"].includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }
  const listing = await Accommodation.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!listing) throw ApiError.notFound("Accommodation not found");
  new ApiResponse(200, listing, "Status updated").send(res);
});
