const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matchedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  matchReason: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  viewedAt: {
    type: Date,
  },
  respondedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
matchSchema.index({ userId: 1, matchedUserId: 1 });
matchSchema.index({ userId: 1, status: 1 });
matchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
