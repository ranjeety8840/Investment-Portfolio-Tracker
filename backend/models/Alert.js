const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  assetName: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: ['price_above', 'price_below', 'percentage_change', 'volume_spike'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  triggeredAt: Date,
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
alertSchema.index({ user: 1, isActive: 1 });
alertSchema.index({ symbol: 1, isActive: 1 });

module.exports = mongoose.model('Alert', alertSchema);
