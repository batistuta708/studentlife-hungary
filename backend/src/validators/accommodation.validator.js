const { body, param } = require("express-validator");

exports.createAccommodation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("type").isIn(["dormitory", "studio", "shared-apartment", "private-apartment", "homestay"]),
  body("location.address").trim().notEmpty(),
  body("location.city").trim().notEmpty(),
  body("price.amount").isNumeric().withMessage("Price amount is required"),
  body("capacity.availableRooms").isInt({ min: 0 }),
];

exports.updateAccommodation = [
  param("id").isMongoId().withMessage("Invalid accommodation id"),
  body("price.amount").optional().isNumeric(),
];

exports.updateStatus = [
  param("id").isMongoId(),
  body("status").isIn(["pending", "approved", "rejected", "rented", "expired"]),
];
