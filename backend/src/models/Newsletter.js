const mongoose = require("mongoose");
const crypto = require("crypto");

const { Schema } = mongoose;

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    // Nullable — the newsletter accepts subscriptions from visitors who never register.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },

    status: {
      type: String,
      enum: ["pending", "subscribed", "unsubscribed"],
      default: "pending",
      index: true,
    },
    // Double opt-in token, and a separate token for one-click unsubscribe links in emails.
    confirmToken: { type: String, select: false },
    unsubscribeToken: { type: String, default: () => crypto.randomBytes(20).toString("hex") },

    // Coarse interest tags so future campaigns can be segmented (e.g. only "jobs" subscribers).
    interests: [{ type: String, enum: ["jobs", "scholarships", "accommodation", "blog", "general"] }],

    subscribedAt: { type: Date },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

newsletterSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Newsletter", newsletterSchema);
