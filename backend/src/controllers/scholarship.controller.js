const { Scholarship } = require("../models");
const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("./handlerFactory");

const base = factory(Scholarship, { populate: ["applicableUniversities"] });

exports.getAll = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Scholarship.find(), req.query).filter().search().sort().limitFields().paginate();
  const query = features.query.populate({ path: "applicableUniversities", select: "name slug" });
  const [docs, total] = await Promise.all([query, Scholarship.countDocuments(features.query.getFilter())]);

  new ApiResponse(200, docs, "Fetched successfully", {
    page: features.pagination.page,
    limit: features.pagination.limit,
    total,
    totalPages: Math.ceil(total / features.pagination.limit),
  }).send(res);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  ).populate({ path: "applicableUniversities", select: "name slug" });
  if (!scholarship) throw ApiError.notFound("Scholarship not found");
  new ApiResponse(200, scholarship).send(res);
});

exports.create = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.create({ ...req.body, postedBy: req.user._id });
  new ApiResponse(201, scholarship, "Scholarship created").send(res);
});

exports.update = base.updateOne;
exports.remove = base.deleteOne;
