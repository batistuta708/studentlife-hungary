const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Memory storage — files are streamed straight to Cloudinary (see upload.controller.js)
// rather than written to disk first, so nothing lingers on the server's filesystem.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest("Only JPEG, PNG, WEBP, or AVIF images are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
});

module.exports = upload;
