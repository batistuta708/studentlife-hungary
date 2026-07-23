const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Generates standard CRUD handlers for a Mongoose model. Resource controllers use this
 * for the boilerplate parts (list/get/delete) and layer custom logic (slug lookup, view
 * counters, ownership checks, population) on top — see controllers/job.controller.js for
 * an example that mixes factory handlers with bespoke ones.
 */
const factory = (Model, { searchable = true, populate = [] } = {}) => ({
  getAll: asyncHandler(async (req, res) => {
    let query = Model.find();
    const features = new ApiFeatures(query, req.query).filter().search(searchable).sort().limitFields().paginate();

    const [docs, total] = await Promise.all([
      populate.length ? features.query.populate(populate) : features.query,
      Model.countDocuments(features.query.getFilter()),
    ]);

    new ApiResponse(200, docs, "Fetched successfully", {
      page: features.pagination.page,
      limit: features.pagination.limit,
      total,
      totalPages: Math.ceil(total / features.pagination.limit),
    }).send(res);
  }),

  getOne: asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate.length) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw ApiError.notFound("Resource not found");
    new ApiResponse(200, doc).send(res);
  }),

  getBySlug: asyncHandler(async (req, res) => {
    let query = Model.findOne({ slug: req.params.slug });
    if (populate.length) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw ApiError.notFound("Resource not found");
    new ApiResponse(200, doc).send(res);
  }),

  createOne: asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    new ApiResponse(201, doc, "Created successfully").send(res);
  }),

  updateOne: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound("Resource not found");
    new ApiResponse(200, doc, "Updated successfully").send(res);
  }),

  deleteOne: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound("Resource not found");
    new ApiResponse(200, null, "Deleted successfully").send(res);
  }),
});

module.exports = factory;
