const mongoose = require('mongoose');

const startupIdeaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    targetMarket: {
      type: String,
    },
    industry: {
      type: String,
    },
    fundingStage: {
      type: String,
      enum: ['Idea', 'MVP', 'Prototype', 'Pre-Launch', 'Launched'],
      default: 'Idea',
    },
    estimatedFunding: {
      type: Number,
    },
    pitchDeckUrl: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
],
    status: {
      type: String,
      enum: ['Active', 'Seeking Co-founder', 'Paused', 'Launched'],
      default: 'Active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

startupIdeaSchema.index({ userId: 1, createdAt: -1 });
startupIdeaSchema.index({ industry: 1 });
startupIdeaSchema.index({ fundingStage: 1 });
startupIdeaSchema.index({ status: 1 });

module.exports = mongoose.model('StartupIdea', startupIdeaSchema);