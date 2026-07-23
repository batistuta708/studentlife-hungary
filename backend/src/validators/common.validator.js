const { param, query, body } = require("express-validator");

exports.mongoIdParam = (name = "id") => [param(name).isMongoId().withMessage(`Invalid ${name}`)];

exports.paginationQuery = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];

exports.newsletterSubscribe = [body("email").isEmail().withMessage("A valid email is required")];
