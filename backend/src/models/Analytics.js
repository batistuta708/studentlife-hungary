const mongoose = require("mongoose");

const { Schema } = mongoose;

// Lightweight event log rather than pre-aggregated counters — keeps writes cheap (one
// insert per event) and lets the Admin Dashboard build arbitrary aggregations
// (by day, by content type, by referrer) with Mongo's aggregation pipeline instead of
// being locked into whatever counters were predefined up front.
const analyticsSchema = new Schema(
  {
    eventType: {
      type: String,
      enum: [
        "page-view",
        "article-view",
        "job-view",
        "accommodation-view",
        "university-view",
        "search",
        "signup",
        "login",
        "newsletter-signup",
        "bookmark-added",
        "listing-submitted",
      ],
      required: true,
      index: true,
    },
    // Polymorphic reference to whatever content the event relates to (nullable for
    // events like "signup" or "search" that aren't tied to a content document).
    targetType: {
      type: String,
      enum: ["Article", "Job", "Accommodation", "University", "Scholarship", null],
      default: null,
    },
    targetId: { type: Schema.Types.ObjectId, default: null },

    user: { type: Schema.Types.ObjectId, ref: "User", default: null }, // null for anonymous visitors
    sessionId: { type: String }, // anonymous session correlation, no PII

    meta: {
      searchQuery: { type: String },
      referrer: { type: String },
      path: { type: String },
      country: { type: String },
      device: { type: String, enum: ["mobile", "desktop", "tablet", "unknown"] },
    },

    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 400 }, // 400-day TTL
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
