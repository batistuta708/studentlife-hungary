const router = require("express").Router();
const ctrl = require("../../controllers/analytics.controller");
const { optionalAuth, protect } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");

router.post("/track", optionalAuth, ctrl.track); // public — logs anonymous + logged-in events
router.get("/dashboard", protect, restrictTo("editor", "admin"), ctrl.getDashboardSummary);

module.exports = router;
