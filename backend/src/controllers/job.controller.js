const { Job } = require("../models");
const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("./handlerFactory");

const base = factory(Job, { populate: ["category", { path: "postedBy", select: "name" }] });

exports.getAll = asyncHandler(async (req, res) => {
  const filterQuery = { ...req.query };
  // Public visitors only see approved, non-expired jobs; editors/admins can see everything
  // (needed for the "Approve Listings" admin workflow).
  if (!req.user || !["editor", "admin"].includes(req.user.role)) {
    filterQuery.status = "approved";
  }

  const features = new ApiFeatures(Job.find(), filterQuery).filter().search().sort().limitFields().paginate();
  const query = features.query.populate(["category", { path: "postedBy", select: "name" }]);
  const [docs, total] = await Promise.all([query, Job.countDocuments(features.query.getFilter())]);

  new ApiResponse(200, docs, "Fetched successfully", {
    page: features.pagination.page,
    limit: features.pagination.limit,
    total,
    totalPages: Math.ceil(total / features.pagination.limit),
  }).send(res);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true }).populate(
    ["category", { path: "postedBy", select: "name" }]
  );
  if (!job) throw ApiError.notFound("Job not found");
  new ApiResponse(200, job).send(res);
});

exports.create = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  new ApiResponse(201, job, "Job submitted — pending admin approval").send(res);
});

exports.update = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound("Job not found");

  const isOwner = job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && !["editor", "admin"].includes(req.user.role)) {
    throw ApiError.forbidden("You do not have permission to edit this listing");
  }

  Object.assign(job, req.body);
  await job.save();
  new ApiResponse(200, job, "Job updated").send(res);
});

exports.remove = base.deleteOne;

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "rejected", "expired", "filled"].includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }
  const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!job) throw ApiError.notFound("Job not found");
  new ApiResponse(200, job, "Status updated").send(res);
});
