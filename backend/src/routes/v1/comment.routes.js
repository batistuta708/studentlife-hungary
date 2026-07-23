const router = require("express").Router();
const ctrl = require("../../controllers/comment.controller");
const { protect } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");

router.get("/target/:targetType/:targetId", ctrl.getForTarget);
router.post("/", protect, ctrl.create);
router.post("/:id/like", protect, ctrl.toggleLike);
router.delete("/:id", protect, ctrl.remove);

// Admin moderation
router.get("/admin/all", protect, restrictTo("editor", "admin"), ctrl.getAllForAdmin);
router.patch("/:id/status", protect, restrictTo("editor", "admin"), ctrl.updateStatus);

module.exports = router;
