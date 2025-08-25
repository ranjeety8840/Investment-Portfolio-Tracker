const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/portfolios
// @desc    Get all portfolios for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ 
      user: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/portfolios/:id
// @desc    Get single portfolio
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/portfolios
// @desc    Create new portfolio
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Portfolio name is required and must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const portfolio = new Portfolio({
      name,
      description,
      user: req.user._id
    });

    await portfolio.save();

    res.status(201).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/portfolios/:id
// @desc    Update portfolio
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/portfolios/:id
// @desc    Delete portfolio (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/portfolios/:id/assets
// @desc    Add asset to portfolio
// @access  Private
router.post('/:id/assets', auth, [
  body('symbol').trim().isLength({ min: 1 }).withMessage('Asset symbol is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Asset name is required'),
  body('type').isIn(['stock', 'cryptocurrency', 'bond', 'etf', 'mutual_fund', 'commodity']).withMessage('Invalid asset type'),
  body('quantity').isFloat({ min: 0.000001 }).withMessage('Quantity must be positive'),
  body('averagePurchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const { symbol, name, type, quantity, averagePurchasePrice, sector, exchange } = req.body;

    // Check if asset already exists in portfolio
    const existingAsset = portfolio.assets.find(asset => asset.symbol === symbol.toUpperCase());
    
    if (existingAsset) {
      // Update existing asset (average the purchase price)
      const totalQuantity = existingAsset.quantity + quantity;
      const totalValue = (existingAsset.quantity * existingAsset.averagePurchasePrice) + (quantity * averagePurchasePrice);
      
      existingAsset.quantity = totalQuantity;
      existingAsset.averagePurchasePrice = totalValue / totalQuantity;
    } else {
      // Add new asset
      portfolio.assets.push({
        symbol: symbol.toUpperCase(),
        name,
        type,
        quantity,
        averagePurchasePrice,
        sector,
        exchange
      });
    }

    await portfolio.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      portfolio: portfolio._id,
      type: 'buy',
      symbol: symbol.toUpperCase(),
      assetName: name,
      assetType: type,
      quantity,
      price: averagePurchasePrice
    });
    await transaction.save();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Add asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/portfolios/:id/assets/:assetId
// @desc    Update asset in portfolio
// @access  Private
router.put('/:id/assets/:assetId', auth, [
  body('quantity').optional().isFloat({ min: 0.000001 }),
  body('averagePurchasePrice').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const asset = portfolio.assets.id(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Update asset properties
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        asset[key] = req.body[key];
      }
    });

    await portfolio.save();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/portfolios/:id/assets/:assetId
// @desc    Remove asset from portfolio
// @access  Private
router.delete('/:id/assets/:assetId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const asset = portfolio.assets.id(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Create sell transaction record
    const transaction = new Transaction({
      user: req.user._id,
      portfolio: portfolio._id,
      type: 'sell',
      symbol: asset.symbol,
      assetName: asset.name,
      assetType: asset.type,
      quantity: asset.quantity,
      price: asset.currentPrice || asset.averagePurchasePrice
    });
    await transaction.save();

    // Remove asset
    portfolio.assets.pull(req.params.assetId);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Asset removed successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Remove asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
