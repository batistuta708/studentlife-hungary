const router = require("express").Router();
const ctrl = require("../../controllers/bookmark.controller");
const { protect } = require("../../middlewares/auth");

router.use(protect); // every bookmark route is for the logged-in user's own bookmarks

router.get("/", ctrl.getMine);
router.post("/toggle", ctrl.toggle);

module.exports = router;
