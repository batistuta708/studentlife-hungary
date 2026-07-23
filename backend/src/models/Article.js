const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true }, // rich text / MDX stored as HTML or markdown
    coverImage: {
      url: { type: String, required: true },
      publicId: { type: String },
      alt: { type: String, default: "" }, // required for accessible + SEO-friendly images
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: String, trim: true, lowercase: true }],

    status: {
      type: String,
      enum: ["draft", "pending-review", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },

    // Engagement / discovery
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // array enables "did I like this" checks
    likesCount: { type: Number, default: 0 }, // denormalized counter for fast sort-by-popular
    readingTimeMinutes: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false },

    // SEO
    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
      canonicalUrl: { type: String },
      ogImage: { type: String },
    },

    relatedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  { timestamps: true }
);

// Full-text search across title/excerpt/content/tags
articleSchema.index(
  { title: "text", excerpt: "text", content: "text", tags: "text" },
  { weights: { title: 10, tags: 5, excerpt: 3, content: 1 }, name: "ArticleTextIndex" }
);
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ categories: 1 });
articleSchema.index({ isFeatured: 1, publishedAt: -1 });

articleSchema.pre("validate", function generateSlug(next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

articleSchema.pre("save", function computeReadingTime(next) {
  if (this.isModified("content")) {
    const words = this.content.trim().split(/\s+/).length;
    this.readingTimeMinutes = Math.max(1, Math.round(words / 200)); // ~200 wpm
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
