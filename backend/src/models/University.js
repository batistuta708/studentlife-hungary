const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const universitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    logo: { type: String },
    coverImage: { type: String },
    description: { type: String, required: true },

    city: { type: String, required: true, index: true },
    address: { type: String },
    website: { type: String },
    foundedYear: { type: Number },
    type: { type: String, enum: ["public", "private", "church-affiliated"], default: "public" },

    // High-level program info; a full course catalog is out of scope for this platform,
    // so we store representative fields of studies rather than a nested course collection.
    fieldsOfStudy: [{ type: String }],
    degreeLevels: [{ type: String, enum: ["bachelor", "master", "phd", "exchange"] }],
    languagesOfInstruction: [{ type: String }],

    tuitionRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "EUR" },
      period: { type: String, enum: ["year", "semester"], default: "year" },
    },

    internationalStudentCount: { type: Number },
    ranking: {
      national: { type: Number },
      world: { type: Number },
    },

    applicationDeadlines: [
      {
        intake: { type: String }, // e.g. "Fall 2027"
        deadline: { type: Date },
      },
    ],

    scholarshipsAvailable: { type: Boolean, default: false },
    contact: {
      admissionsEmail: { type: String },
      phone: { type: String },
    },

    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },

    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
    },
  },
  { timestamps: true }
);

universitySchema.index({ name: "text", description: "text", fieldsOfStudy: "text" });
universitySchema.index({ city: 1, isActive: 1 });

universitySchema.pre("validate", function generateSlug(next) {
  if (this.name && (this.isModified("name") || !this.slug)) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("University", universitySchema);
