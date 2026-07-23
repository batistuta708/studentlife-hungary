const { Bookmark, User } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const savedFieldFor = {
  Article: "savedArticles",
  Job: "savedJobs",
  Accommodation: "savedAccommodation",
};

exports.getMine = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.targetType) filter.targetType = req.query.targetType;

  const bookmarks = await Bookmark.find(filter).sort("-createdAt").populate("targetId");
  new ApiResponse(200, bookmarks).send(res);
});

// Toggling keeps this a single idempotent-feeling endpoint for the frontend's bookmark
// button, instead of separate add/remove endpoints the client has to choose between.
exports.toggle = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  if (!savedFieldFor[targetType]) {
    throw ApiError.badRequest("Invalid targetType — must be Article, Job, or Accommodation");
  }

  const existing = await Bookmark.findOne({ user: req.user._id, targetType, targetId });
  const savedField = savedFieldFor[targetType];

  if (existing) {
    await existing.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { [savedField]: targetId } });
    return new ApiResponse(200, { bookmarked: false }, "Bookmark removed").send(res);
  }

  await Bookmark.create({ user: req.user._id, targetType, targetId });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { [savedField]: targetId } });
  new ApiResponse(201, { bookmarked: true }, "Bookmark added").send(res);
});
