const router = require("express").Router();

router.use("/articles", require("./article.routes"));
router.use("/jobs", require("./job.routes"));
router.use("/accommodation", require("./accommodation.routes"));
router.use("/universities", require("./university.routes"));
router.use("/scholarships", require("./scholarship.routes"));
router.use("/categories", require("./category.routes"));
router.use("/comments", require("./comment.routes"));
router.use("/bookmarks", require("./bookmark.routes"));
router.use("/newsletter", require("./newsletter.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/users", require("./user.routes"));
router.use("/auth", require("./auth.routes"));
router.use("/uploads", require("./upload.routes"));

module.exports = router;
