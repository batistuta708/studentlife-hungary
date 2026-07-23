const router = require("express").Router();
const ctrl = require("../../controllers/upload.controller");
const upload = require("../../middlewares/upload");
const { protect } = require("../../middlewares/auth");

// Any authenticated user can upload (needed for students submitting job/accommodation
// listings with images, not just admins) — the folder param scopes where it lands in
// Cloudinary, and moderation of the listing itself still happens via the existing
// approval workflow (Phase 3), so an unmoderated image can't go live without review.
router.post("/:folder", protect, upload.single("image"), ctrl.uploadImage);
router.delete("/", protect, ctrl.deleteImage);

module.exports = router;
