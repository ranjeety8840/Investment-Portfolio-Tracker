const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
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
  assetType: {
    type: String,
    enum: ['stock', 'cryptocurrency', 'bond', 'etf', 'mutual_fund', 'commodity'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.000001, 'Quantity must be positive']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  fees: {
    type: Number,
    default: 0,
    min: [0, 'Fees cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
transactionSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.price + (this.fees || 0);
  next();
});

// Index for better query performance
transactionSchema.index({ user: 1, executedAt: -1 });
transactionSchema.index({ portfolio: 1, executedAt: -1 });
transactionSchema.index({ symbol: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
