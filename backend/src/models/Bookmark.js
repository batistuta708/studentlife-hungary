const mongoose = require("mongoose");

const { Schema } = mongoose;

// A single polymorphic collection backs "Saved Articles / Saved Jobs / Saved
// Accommodation" from the spec, instead of three near-identical collections.
// User.savedArticles/savedJobs/savedAccommodation (see User.js) denormalize the same
// data for fast profile-page reads; this collection is the source of truth and is what
// gets queried/paginated on dedicated "Bookmarks" pages.
const bookmarkSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: {
      type: String,
      enum: ["Article", "Job", "Accommodation"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
  },
  { timestamps: true }
);

// A user can only bookmark the same item once.
bookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
