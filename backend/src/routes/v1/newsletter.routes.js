const router = require("express").Router();
const ctrl = require("../../controllers/newsletter.controller");
const { protect } = require("../../middlewares/auth");
const { restrictTo } = require("../../middlewares/role");
const validate = require("../../middlewares/validate");
const { newsletterSubscribe } = require("../../validators/common.validator");

router.post("/subscribe", newsletterSubscribe, validate, ctrl.subscribe);
router.get("/confirm", ctrl.confirm);
router.get("/unsubscribe", ctrl.unsubscribe);

// Admin
router.get("/admin/all", protect, restrictTo("admin"), ctrl.getAllForAdmin);
router.delete("/admin/:id", protect, restrictTo("admin"), ctrl.removeSubscriber);

module.exports = router;
