const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Funding', 'Technical', 'Marketing', 'General', 'Resources', 'Advice'],
      default: 'General',
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
    isPinned: {
      type: Boolean,
      default: false,
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
    media: [
  {
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
    },
    fileName: String,
  },
],
  },
  { timestamps: true }
);

communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ userId: 1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);