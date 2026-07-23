const router = require("express").Router();
const ctrl = require("../../controllers/accommodation.controller");
const { protect, optionalAuth } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");
const validate = require("../../middlewares/validate");
const { createAccommodation, updateAccommodation, updateStatus } = require("../../validators/accommodation.validator");

router.get("/", optionalAuth, ctrl.getAll);
router.get("/:slug", ctrl.getBySlug);

router.post("/", protect, createAccommodation, validate, ctrl.create);
router.patch("/:id", protect, updateAccommodation, validate, ctrl.update);
router.patch("/:id/status", protect, restrictTo("editor", "admin"), updateStatus, validate, ctrl.updateStatus);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
