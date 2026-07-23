const { body, param } = require("express-validator");

exports.createArticle = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 160 }),
  body("excerpt").trim().notEmpty().withMessage("Excerpt is required").isLength({ max: 300 }),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("coverImage.url").notEmpty().withMessage("Cover image URL is required"),
  body("categories").optional().isArray(),
  body("categories.*").optional().isMongoId(),
  body("tags").optional().isArray(),
];

exports.updateArticle = [
  param("id").isMongoId().withMessage("Invalid article id"),
  body("title").optional().trim().isLength({ max: 160 }),
  body("excerpt").optional().trim().isLength({ max: 300 }),
  body("content").optional().trim().notEmpty(),
];

exports.updateStatus = [
  param("id").isMongoId(),
  body("status").isIn(["draft", "pending-review", "published", "archived"]),
];
