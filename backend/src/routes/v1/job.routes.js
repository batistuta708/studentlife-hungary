const router = require("express").Router();
const ctrl = require("../../controllers/job.controller");
const { protect, optionalAuth } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");
const validate = require("../../middlewares/validate");
const { createJob, updateJob, updateStatus } = require("../../validators/job.validator");

router.get("/", optionalAuth, ctrl.getAll);
router.get("/:slug", ctrl.getBySlug);

router.post("/", protect, createJob, validate, ctrl.create); // any logged-in user can post a job (goes to pending)
router.patch("/:id", protect, updateJob, validate, ctrl.update);
router.patch("/:id/status", protect, restrictTo("editor", "admin"), updateStatus, validate, ctrl.updateStatus);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
