const router = require("express").Router();
const ctrl = require("../../controllers/university.controller");
const { protect } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getBySlug);

router.post("/", protect, restrictTo("editor", "admin"), ctrl.create);
router.patch("/:id", protect, restrictTo("editor", "admin"), ctrl.update);
router.delete("/:id", protect, restrictTo("admin"), ctrl.remove);

module.exports = router;
