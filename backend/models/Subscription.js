const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  amount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'suspended', 'expired'],
    default: 'active',
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
  },
  features: {
    unlimitedMessaging: { type: Boolean, default: false },
    priorityMatching: { type: Boolean, default: false },
    videoCall: { type: Boolean, default: false },
    profileBadge: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
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
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
