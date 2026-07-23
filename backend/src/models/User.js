const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    // Absent for users who registered via Google OAuth only.
    password: {
      type: String,
      minlength: 8,
      select: false, // never returned by default on find()
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs with no googleId
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }, // Cloudinary asset id, for deletion
    },
    role: {
      type: String,
      enum: ["student", "editor", "admin"],
      default: "student",
    },
    nationality: { type: String, trim: true },
    university: { type: Schema.Types.ObjectId, ref: "University" },
    studyLevel: {
      type: String,
      enum: ["bachelor", "master", "phd", "exchange", "language-course", "other"],
    },

    // --- Saved / bookmarked content (denormalized for fast profile reads;
    // Bookmark collection remains the source of truth for polymorphic queries) ---
    savedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    savedAccommodation: [{ type: Schema.Types.ObjectId, ref: "Accommodation" }],

    newsletterSubscribed: { type: Boolean, default: false },

    // --- Auth / security ---
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: { type: [String], select: false, default: [] }, // supports multi-device logout
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true }, // soft-disable instead of deleting

    // --- UI preference persisted server-side so it follows the user across devices ---
    themePreference: { type: String, enum: ["light", "dark", "system"], default: "system" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak sensitive fields even if `select` is bypassed downstream.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
