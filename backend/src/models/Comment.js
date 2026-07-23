const mongoose = require("mongoose");

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Polymorphic target — the spec currently only calls for comments on Articles,
    // but modeling it this way avoids a migration if Jobs/Accommodation get comments later.
    targetType: {
      type: String,
      enum: ["Article"],
      default: "Article",
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },

    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // for replies
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
      index: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model("Comment", commentSchema);
