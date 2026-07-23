const { Comment } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Public: approved, top-level comments for a target, with replies nested underneath.
exports.getForTarget = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;

  const comments = await Comment.find({ targetType, targetId, status: "approved", parentComment: null })
    .sort("-createdAt")
    .populate({ path: "author", select: "name avatar" });

  const replies = await Comment.find({ targetType, targetId, status: "approved", parentComment: { $ne: null } })
    .sort("createdAt")
    .populate({ path: "author", select: "name avatar" });

  const repliesByParent = replies.reduce((acc, reply) => {
    const key = reply.parentComment.toString();
    acc[key] = acc[key] || [];
    acc[key].push(reply);
    return acc;
  }, {});

  const withReplies = comments.map((c) => ({
    ...c.toObject(),
    replies: repliesByParent[c._id.toString()] || [],
  }));

  new ApiResponse(200, withReplies).send(res);
});

exports.create = asyncHandler(async (req, res) => {
  const { content, targetType, targetId, parentComment } = req.body;

  const comment = await Comment.create({
    content,
    targetType,
    targetId,
    parentComment: parentComment || null,
    author: req.user._id,
    // Auto-approve for editors/admins; student comments queue for moderation.
    status: ["editor", "admin"].includes(req.user.role) ? "approved" : "pending",
  });

  new ApiResponse(201, comment, "Comment submitted").send(res);
});

exports.remove = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && !["editor", "admin"].includes(req.user.role)) {
    throw ApiError.forbidden("You do not have permission to delete this comment");
  }

  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });
  new ApiResponse(200, null, "Comment deleted").send(res);
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  const userId = req.user._id.toString();
  const alreadyLiked = comment.likes.some((id) => id.toString() === userId);
  comment.likes = alreadyLiked
    ? comment.likes.filter((id) => id.toString() !== userId)
    : [...comment.likes, req.user._id];

  await comment.save();
  new ApiResponse(200, { liked: !alreadyLiked, likesCount: comment.likes.length }).send(res);
});

// --- Admin moderation ---
exports.getAllForAdmin = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const comments = await Comment.find(filter)
    .sort("-createdAt")
    .populate([{ path: "author", select: "name email" }]);
  new ApiResponse(200, comments).send(res);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "rejected", "spam"].includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }
  const comment = await Comment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!comment) throw ApiError.notFound("Comment not found");
  new ApiResponse(200, comment, "Status updated").send(res);
});
