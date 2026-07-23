const { Article } = require("../models");
const ApiFeatures = require("../utils/apiFeatures");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("./handlerFactory");

const base = factory(Article, { populate: [{ path: "author", select: "name avatar" }, "categories"] });

// Public list — only published articles, unless an editor/admin explicitly requests otherwise.
exports.getAll = asyncHandler(async (req, res) => {
  const filterQuery = { ...req.query };
  if (!req.user || !["editor", "admin"].includes(req.user.role)) {
    filterQuery.status = "published";
  }

  const features = new ApiFeatures(Article.find(), filterQuery)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const query = features.query.populate([{ path: "author", select: "name avatar" }, "categories"]);
  const [docs, total] = await Promise.all([query, Article.countDocuments(features.query.getFilter())]);

  new ApiResponse(200, docs, "Fetched successfully", {
    page: features.pagination.page,
    limit: features.pagination.limit,
    total,
    totalPages: Math.ceil(total / features.pagination.limit),
  }).send(res);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  ).populate([{ path: "author", select: "name avatar" }, "categories", { path: "relatedArticles", select: "title slug coverImage excerpt" }]);

  if (!article) throw ApiError.notFound("Article not found");
  new ApiResponse(200, article).send(res);
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const docs = await Article.find({ status: "published", isFeatured: true })
    .sort("-publishedAt")
    .limit(Number(req.query.limit) || 5)
    .populate({ path: "author", select: "name avatar" });
  new ApiResponse(200, docs).send(res);
});

exports.getPopular = asyncHandler(async (req, res) => {
  const docs = await Article.find({ status: "published" })
    .sort("-views -likesCount")
    .limit(Number(req.query.limit) || 5);
  new ApiResponse(200, docs).send(res);
});

exports.create = asyncHandler(async (req, res) => {
  const article = await Article.create({ ...req.body, author: req.user._id });
  new ApiResponse(201, article, "Article created").send(res);
});

exports.update = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw ApiError.notFound("Article not found");

  const isOwner = article.author.toString() === req.user._id.toString();
  if (!isOwner && !["editor", "admin"].includes(req.user.role)) {
    throw ApiError.forbidden("You do not have permission to edit this article");
  }

  Object.assign(article, req.body);
  await article.save();
  new ApiResponse(200, article, "Article updated").send(res);
});

exports.remove = base.deleteOne;

exports.toggleLike = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw ApiError.notFound("Article not found");

  const userId = req.user._id.toString();
  const alreadyLiked = article.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    article.likes = article.likes.filter((id) => id.toString() !== userId);
  } else {
    article.likes.push(req.user._id);
  }
  article.likesCount = article.likes.length;
  await article.save();

  new ApiResponse(200, { liked: !alreadyLiked, likesCount: article.likesCount }).send(res);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["draft", "pending-review", "published", "archived"].includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }
  const update = { status };
  if (status === "published") update.publishedAt = new Date();

  const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!article) throw ApiError.notFound("Article not found");
  new ApiResponse(200, article, "Status updated").send(res);
});
