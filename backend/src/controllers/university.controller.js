const { University } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("./handlerFactory");

const base = factory(University);

exports.getAll = base.getAll;
exports.create = base.createOne;
exports.update = base.updateOne;
exports.remove = base.deleteOne;

exports.getBySlug = asyncHandler(async (req, res) => {
  const university = await University.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!university) throw ApiError.notFound("University not found");
  new ApiResponse(200, university).send(res);
});
