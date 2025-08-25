const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isActive = true, isTriggered } = req.query;
    const query = { user: req.user._id };

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isTriggered !== undefined) query.isTriggered = isTriggered === 'true';

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/alerts
// @desc    Create new alert
// @access  Private
router.post('/', auth, [
  body('symbol').trim().isLength({ min: 1 }).withMessage('Asset symbol is required'),
  body('assetName').trim().isLength({ min: 1 }).withMessage('Asset name is required'),
  body('alertType').isIn(['price_above', 'price_below', 'percentage_change', 'volume_spike']).withMessage('Invalid alert type'),
  body('targetValue').isFloat({ min: 0 }).withMessage('Target value must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symbol, assetName, alertType, targetValue } = req.body;

    const alert = new Alert({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
      assetName,
      alertType,
      targetValue
    });

    await alert.save();

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert
// @access  Private
router.put('/:id', auth, [
  body('targetValue').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
