const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/assets/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, portfolio, symbol, type } = req.query;
    const query = { user: req.user._id };

    if (portfolio) query.portfolio = portfolio;
    if (symbol) query.symbol = symbol.toUpperCase();
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('portfolio', 'name')
      .sort({ executedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assets/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('portfolio', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assets/summary
// @desc    Get user's asset summary across all portfolios
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    
    const portfolios = await Portfolio.find({ 
      user: req.user._id, 
      isActive: true 
    });

    // Aggregate assets across all portfolios
    const assetSummary = {};
    let totalValue = 0;
    let totalInvestment = 0;

    portfolios.forEach(portfolio => {
      portfolio.assets.forEach(asset => {
        const key = asset.symbol;
        const currentValue = asset.quantity * (asset.currentPrice || asset.averagePurchasePrice);
        const investmentValue = asset.quantity * asset.averagePurchasePrice;

        if (assetSummary[key]) {
          assetSummary[key].quantity += asset.quantity;
          assetSummary[key].totalValue += currentValue;
          assetSummary[key].totalInvestment += investmentValue;
        } else {
          assetSummary[key] = {
            symbol: asset.symbol,
            name: asset.name,
            type: asset.type,
            quantity: asset.quantity,
            totalValue: currentValue,
            totalInvestment: investmentValue,
            sector: asset.sector
          };
        }

        totalValue += currentValue;
        totalInvestment += investmentValue;
      });
    });

    // Calculate gain/loss for each asset
    Object.keys(assetSummary).forEach(key => {
      const asset = assetSummary[key];
      asset.gainLoss = asset.totalValue - asset.totalInvestment;
      asset.gainLossPercentage = asset.totalInvestment > 0 
        ? ((asset.totalValue - asset.totalInvestment) / asset.totalInvestment) * 100 
        : 0;
      asset.averagePrice = asset.totalInvestment / asset.quantity;
      asset.currentPrice = asset.totalValue / asset.quantity;
    });

    res.json({
      success: true,
      data: {
        assets: Object.values(assetSummary),
        summary: {
          totalValue,
          totalInvestment,
          totalGainLoss: totalValue - totalInvestment,
          totalGainLossPercentage: totalInvestment > 0 
            ? ((totalValue - totalInvestment) / totalInvestment) * 100 
            : 0,
          assetCount: Object.keys(assetSummary).length,
          portfolioCount: portfolios.length
        }
      }
    });
  } catch (error) {
    console.error('Get asset summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
