const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    likedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ userId: 1, likedUserId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);