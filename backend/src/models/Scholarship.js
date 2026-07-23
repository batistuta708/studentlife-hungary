const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const scholarshipSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    provider: { type: String, required: true }, // e.g. "Stipendium Hungaricum", "Erasmus+"
    description: { type: String, required: true },

    coverageType: {
      type: String,
      enum: ["full-tuition", "partial-tuition", "living-stipend", "full-ride", "travel-grant"],
      required: true,
    },
    amount: {
      value: { type: Number },
      currency: { type: String, default: "HUF" },
      isFullyFunded: { type: Boolean, default: false },
    },

    eligibleDegreeLevels: [{ type: String, enum: ["bachelor", "master", "phd", "exchange"] }],
    eligibleNationalities: [{ type: String }], // empty array = open to all nationalities
    eligibleFieldsOfStudy: [{ type: String }],

    applicableUniversities: [{ type: Schema.Types.ObjectId, ref: "University" }],

    applicationOpenDate: { type: Date },
    applicationDeadline: { type: Date, required: true, index: true },
    applicationUrl: { type: String, required: true },

    requirements: [{ type: String }],

    status: {
      type: String,
      enum: ["upcoming", "open", "closed"],
      default: "upcoming",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
    },
  },
  { timestamps: true }
);

scholarshipSchema.index({ title: "text", description: "text", provider: "text" });
scholarshipSchema.index({ status: 1, applicationDeadline: 1 });

scholarshipSchema.pre("validate", function generateSlug(next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
