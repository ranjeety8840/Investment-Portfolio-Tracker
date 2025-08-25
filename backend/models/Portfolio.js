const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Portfolio name is required'],
    trim: true,
    maxlength: [100, 'Portfolio name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assets: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['stock', 'cryptocurrency', 'bond', 'etf', 'mutual_fund', 'commodity'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averagePurchasePrice: {
      type: Number,
      required: true,
      min: [0, 'Purchase price cannot be negative']
    },
    currentPrice: {
      type: Number,
      default: 0
    },
    sector: String,
    exchange: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0
  },
  totalInvestment: {
    type: Number,
    default: 0
  },
  totalGainLoss: {
    type: Number,
    default: 0
  },
  totalGainLossPercentage: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate portfolio metrics before saving
portfolioSchema.pre('save', function(next) {
  let totalValue = 0;
  let totalInvestment = 0;

  this.assets.forEach(asset => {
    const assetValue = asset.quantity * (asset.currentPrice || asset.averagePurchasePrice);
    const assetInvestment = asset.quantity * asset.averagePurchasePrice;
    
    totalValue += assetValue;
    totalInvestment += assetInvestment;
  });

  this.totalValue = totalValue;
  this.totalInvestment = totalInvestment;
  this.totalGainLoss = totalValue - totalInvestment;
  this.totalGainLossPercentage = totalInvestment > 0 
    ? ((totalValue - totalInvestment) / totalInvestment) * 100 
    : 0;
  
  this.lastUpdated = new Date();
  next();
});

// Index for better query performance
portfolioSchema.index({ user: 1, createdAt: -1 });
portfolioSchema.index({ 'assets.symbol': 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
