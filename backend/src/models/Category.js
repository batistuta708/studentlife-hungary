const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, maxlength: 300 },
    // A category is scoped to the content type it organizes — a "Visa & Permits" blog
    // category is a different concept from a "Visa & Permits" job filter, even if they
    // share a name, so we tag which resource type each category applies to.
    appliesTo: {
      type: String,
      enum: ["article", "job", "accommodation", "university", "scholarship"],
      required: true,
      index: true,
    },
    icon: { type: String }, // icon name/key rendered on the frontend
    color: { type: String, default: "#2563eb" }, // used for badges/tag pills
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null }, // optional subcategories
    order: { type: Number, default: 0 }, // manual sort order in admin
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ appliesTo: 1, isActive: 1 });

categorySchema.pre("validate", function generateSlug(next) {
  if (this.name && (this.isModified("name") || !this.slug)) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
