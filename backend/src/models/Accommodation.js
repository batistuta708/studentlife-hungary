const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const accommodationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },

    type: {
      type: String,
      enum: ["dormitory", "studio", "shared-apartment", "private-apartment", "homestay"],
      required: true,
      index: true,
    },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      district: { type: String }, // Budapest-specific (e.g. "District VII")
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      nearestUniversity: { type: Schema.Types.ObjectId, ref: "University" },
    },

    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "HUF" },
      period: { type: String, enum: ["month", "semester"], default: "month" },
      utilitiesIncluded: { type: Boolean, default: false },
      depositRequired: { type: Number, default: 0 },
    },

    capacity: {
      totalRooms: { type: Number },
      availableRooms: { type: Number, required: true },
      roommates: { type: Number, default: 0 },
    },

    amenities: [{ type: String }], // e.g. ["WiFi", "Washing Machine", "Furnished"]
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String, default: "" },
      },
    ],

    availableFrom: { type: Date },
    minStayMonths: { type: Number, default: 1 },

    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    listedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "rented", "expired"],
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

accommodationSchema.index({ title: "text", description: "text" });
accommodationSchema.index({ "location.city": 1, type: 1, status: 1 });
accommodationSchema.index({ "price.amount": 1 });
accommodationSchema.index({ "location.coordinates": "2dsphere" }); // enables map/near-me queries

accommodationSchema.pre("validate", function generateSlug(next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
