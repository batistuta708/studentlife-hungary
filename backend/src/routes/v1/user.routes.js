const router = require("express").Router();
const ctrl = require("../../controllers/user.controller");
const { protect } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");

// Self-service (any authenticated user)
router.get("/me", protect, ctrl.getMyProfile);
router.patch("/me", protect, ctrl.updateMyProfile);

// Admin user management
router.get("/", protect, restrictTo("admin"), ctrl.getAll);
router.get("/:id", protect, restrictTo("admin"), ctrl.getOne);
router.patch("/:id/role", protect, restrictTo("admin"), ctrl.updateRole);
router.patch("/:id/toggle-active", protect, restrictTo("admin"), ctrl.toggleActive);
router.delete("/:id", protect, restrictTo("admin"), ctrl.remove);

module.exports = router;
