const { body, param } = require("express-validator");

exports.createJob = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }),
  body("company.name").trim().notEmpty().withMessage("Company name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("employmentType")
    .isIn(["part-time", "full-time", "internship", "freelance", "seasonal"])
    .withMessage("Invalid employment type"),
  body("salary.min").optional().isNumeric(),
  body("salary.max").optional().isNumeric(),
  body("applicationEmail").optional().isEmail(),
  body("applicationUrl").optional().isURL(),
];

exports.updateJob = [
  param("id").isMongoId().withMessage("Invalid job id"),
  body("title").optional().trim().isLength({ max: 150 }),
  body("employmentType")
    .optional()
    .isIn(["part-time", "full-time", "internship", "freelance", "seasonal"]),
];

exports.updateStatus = [
  param("id").isMongoId(),
  body("status").isIn(["pending", "approved", "rejected", "expired", "filled"]),
];
