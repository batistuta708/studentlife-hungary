const cloudinary = require("../config/cloudinary");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function streamUpload(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `studentlife-hungary/${folder}`,
        // Automatic format + quality selection (serves AVIF/WEBP to supporting
        // browsers, falls back gracefully) — satisfies the "Optimized Images" /
        // "Automatic image optimization" requirement without any manual resizing.
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

// folder groups uploads by content type in Cloudinary (articles/, jobs/, accommodation/,
// avatars/, universities/) so the admin media library stays organized.
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const folder = req.params.folder || "misc";
  const allowedFolders = ["articles", "jobs", "accommodation", "universities", "avatars"];
  if (!allowedFolders.includes(folder)) {
    throw ApiError.badRequest(`Invalid folder — must be one of: ${allowedFolders.join(", ")}`);
  }

  const result = await streamUpload(req.file.buffer, folder);

  new ApiResponse(
    201,
    { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
    "Image uploaded"
  ).send(res);
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest("publicId is required");

  await cloudinary.uploader.destroy(publicId);
  new ApiResponse(200, null, "Image deleted").send(res);
});
