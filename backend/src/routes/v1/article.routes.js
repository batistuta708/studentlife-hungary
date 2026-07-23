const router = require("express").Router();
const ctrl = require("../../controllers/article.controller");
const { protect, optionalAuth } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");
const validate = require("../../middlewares/validate");
const { createArticle, updateArticle, updateStatus } = require("../../validators/article.validator");

router.get("/", optionalAuth, ctrl.getAll);
router.get("/featured", ctrl.getFeatured);
router.get("/popular", ctrl.getPopular);
router.get("/:slug", ctrl.getBySlug);

router.post("/", protect, restrictTo("editor", "admin"), createArticle, validate, ctrl.create);
router.patch("/:id", protect, updateArticle, validate, ctrl.update);
router.patch("/:id/status", protect, restrictTo("editor", "admin"), updateStatus, validate, ctrl.updateStatus);
router.post("/:id/like", protect, ctrl.toggleLike);
router.delete("/:id", protect, restrictTo("editor", "admin"), ctrl.remove);

module.exports = router;
