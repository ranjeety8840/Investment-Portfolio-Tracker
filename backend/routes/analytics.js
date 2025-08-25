const express = require('express');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/portfolio/:id/performance
// @desc    Get portfolio performance analytics
// @access  Private
router.get('/portfolio/:id/performance', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Calculate performance metrics
    const performance = {
      totalValue: portfolio.totalValue,
      totalInvestment: portfolio.totalInvestment,
      totalGainLoss: portfolio.totalGainLoss,
      totalGainLossPercentage: portfolio.totalGainLossPercentage,
      assetCount: portfolio.assets.length,
      topPerformers: portfolio.assets
        .map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          gainLoss: (asset.quantity * (asset.currentPrice || asset.averagePurchasePrice)) - (asset.quantity * asset.averagePurchasePrice),
          gainLossPercentage: asset.averagePurchasePrice > 0 
            ? (((asset.currentPrice || asset.averagePurchasePrice) - asset.averagePurchasePrice) / asset.averagePurchasePrice) * 100 
            : 0
        }))
        .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
        .slice(0, 5),
      worstPerformers: portfolio.assets
        .map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          gainLoss: (asset.quantity * (asset.currentPrice || asset.averagePurchasePrice)) - (asset.quantity * asset.averagePurchasePrice),
          gainLossPercentage: asset.averagePurchasePrice > 0 
            ? (((asset.currentPrice || asset.averagePurchasePrice) - asset.averagePurchasePrice) / asset.averagePurchasePrice) * 100 
            : 0
        }))
        .sort((a, b) => a.gainLossPercentage - b.gainLossPercentage)
        .slice(0, 5)
    };

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get portfolio performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/portfolio/:id/diversification
// @desc    Get portfolio diversification analysis
// @access  Private
router.get('/portfolio/:id/diversification', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Calculate diversification metrics
    const assetTypeDistribution = {};
    const sectorDistribution = {};
    let totalValue = 0;

    portfolio.assets.forEach(asset => {
      const assetValue = asset.quantity * (asset.currentPrice || asset.averagePurchasePrice);
      totalValue += assetValue;

      // Asset type distribution
      if (assetTypeDistribution[asset.type]) {
        assetTypeDistribution[asset.type] += assetValue;
      } else {
        assetTypeDistribution[asset.type] = assetValue;
      }

      // Sector distribution
      const sector = asset.sector || 'Unknown';
      if (sectorDistribution[sector]) {
        sectorDistribution[sector] += assetValue;
      } else {
        sectorDistribution[sector] = assetValue;
      }
    });

    // Convert to percentages
    const assetTypePercentages = {};
    const sectorPercentages = {};

    Object.keys(assetTypeDistribution).forEach(type => {
      assetTypePercentages[type] = totalValue > 0 ? (assetTypeDistribution[type] / totalValue) * 100 : 0;
    });

    Object.keys(sectorDistribution).forEach(sector => {
      sectorPercentages[sector] = totalValue > 0 ? (sectorDistribution[sector] / totalValue) * 100 : 0;
    });

    // Calculate diversification score (simple Herfindahl index)
    const assetTypeHHI = Object.values(assetTypePercentages).reduce((sum, percentage) => {
      return sum + Math.pow(percentage / 100, 2);
    }, 0);

    const diversificationScore = Math.max(0, (1 - assetTypeHHI) * 100);

    res.json({
      success: true,
      data: {
        assetTypeDistribution: assetTypePercentages,
        sectorDistribution: sectorPercentages,
        diversificationScore: Math.round(diversificationScore),
        totalAssets: portfolio.assets.length,
        recommendations: diversificationScore < 50 
          ? ['Consider diversifying across more asset types', 'Add assets from different sectors']
          : ['Portfolio shows good diversification']
      }
    });
  } catch (error) {
    console.error('Get diversification analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/portfolio/:id/risk
// @desc    Get portfolio risk analysis
// @access  Private
router.get('/portfolio/:id/risk', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Simple risk analysis based on asset types and volatility
    const riskWeights = {
      'stock': 0.7,
      'cryptocurrency': 1.0,
      'bond': 0.3,
      'etf': 0.5,
      'mutual_fund': 0.4,
      'commodity': 0.8
    };

    let weightedRisk = 0;
    let totalValue = 0;

    portfolio.assets.forEach(asset => {
      const assetValue = asset.quantity * (asset.currentPrice || asset.averagePurchasePrice);
      const riskWeight = riskWeights[asset.type] || 0.5;
      
      weightedRisk += assetValue * riskWeight;
      totalValue += assetValue;
    });

    const overallRiskScore = totalValue > 0 ? (weightedRisk / totalValue) * 100 : 0;
    
    let riskLevel = 'Low';
    if (overallRiskScore > 70) riskLevel = 'High';
    else if (overallRiskScore > 40) riskLevel = 'Medium';

    res.json({
      success: true,
      data: {
        riskScore: Math.round(overallRiskScore),
        riskLevel,
        riskFactors: portfolio.assets.map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          riskWeight: riskWeights[asset.type] || 0.5,
          allocation: totalValue > 0 ? ((asset.quantity * (asset.currentPrice || asset.averagePurchasePrice)) / totalValue) * 100 : 0
        })).sort((a, b) => b.riskWeight - a.riskWeight),
        recommendations: overallRiskScore > 70 
          ? ['Consider reducing high-risk assets', 'Add more stable investments like bonds']
          : overallRiskScore > 40
          ? ['Portfolio has moderate risk', 'Monitor volatile assets closely']
          : ['Portfolio has conservative risk profile', 'Consider adding growth assets for higher returns']
      }
    });
  } catch (error) {
    console.error('Get risk analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/overview
// @desc    Get user's overall portfolio analytics
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ 
      user: req.user._id, 
      isActive: true 
    });

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ executedAt: -1 })
      .limit(10);

    // Calculate overall metrics
    let totalValue = 0;
    let totalInvestment = 0;
    let totalAssets = 0;

    portfolios.forEach(portfolio => {
      totalValue += portfolio.totalValue;
      totalInvestment += portfolio.totalInvestment;
      totalAssets += portfolio.assets.length;
    });

    const totalGainLoss = totalValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 
      ? (totalGainLoss / totalInvestment) * 100 
      : 0;

    // Recent activity
    const recentActivity = transactions.map(transaction => ({
      id: transaction._id,
      type: transaction.type,
      symbol: transaction.symbol,
      assetName: transaction.assetName,
      quantity: transaction.quantity,
      price: transaction.price,
      totalAmount: transaction.totalAmount,
      executedAt: transaction.executedAt
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalValue,
          totalInvestment,
          totalGainLoss,
          totalGainLossPercentage,
          portfolioCount: portfolios.length,
          totalAssets
        },
        recentActivity,
        portfolios: portfolios.map(p => ({
          id: p._id,
          name: p.name,
          totalValue: p.totalValue,
          totalGainLoss: p.totalGainLoss,
          totalGainLossPercentage: p.totalGainLossPercentage,
          assetCount: p.assets.length
        }))
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
