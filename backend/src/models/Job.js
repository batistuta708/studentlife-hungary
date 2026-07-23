const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    company: {
      name: { type: String, required: true, trim: true },
      logo: { type: String },
      website: { type: String },
    },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],

    location: {
      city: { type: String, required: true, index: true },
      isRemote: { type: Boolean, default: false },
    },
    employmentType: {
      type: String,
      enum: ["part-time", "full-time", "internship", "freelance", "seasonal"],
      required: true,
      index: true,
    },
    // Student jobs are often restricted by visa/permit rules — surfacing this up front
    // is a core value-add for an international-student-focused platform.
    workPermitRequired: { type: Boolean, default: true },
    languageRequirements: [{ type: String }], // e.g. ["English", "Hungarian - basic"]

    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "HUF" },
      period: { type: String, enum: ["hour", "month", "year"], default: "hour" },
    },

    applicationUrl: { type: String },
    applicationEmail: { type: String },
    applicationDeadline: { type: Date },

    category: { type: Schema.Types.ObjectId, ref: "Category" },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired", "filled"],
      default: "pending",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", "company.name": "text" });
jobSchema.index({ status: 1, applicationDeadline: 1 });
jobSchema.index({ "location.city": 1, employmentType: 1 });

jobSchema.pre("validate", function generateSlug(next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model("Job", jobSchema);
