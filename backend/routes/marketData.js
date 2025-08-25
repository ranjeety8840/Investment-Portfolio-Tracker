const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock market data service (replace with real API integration)
const getMarketData = async (symbol, type = 'stock') => {
  try {
    // This is a mock implementation - replace with actual API calls
    // For Alpha Vantage, CoinGecko, IEX Cloud, etc.
    
    const mockData = {
      symbol: symbol.toUpperCase(),
      price: Math.random() * 1000 + 50, // Random price between 50-1050
      change: (Math.random() - 0.5) * 20, // Random change between -10 to +10
      changePercent: (Math.random() - 0.5) * 10, // Random % change
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      high52Week: Math.random() * 1200 + 100,
      low52Week: Math.random() * 100 + 10,
      lastUpdated: new Date().toISOString()
    };

    return mockData;
  } catch (error) {
    throw new Error(`Failed to fetch market data for ${symbol}`);
  }
};

// @route   GET /api/market-data/quote/:symbol
// @desc    Get current quote for a symbol
// @access  Private
router.get('/quote/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { type = 'stock' } = req.query;

    const marketData = await getMarketData(symbol, type);

    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch market data' });
  }
});

// @route   POST /api/market-data/quotes
// @desc    Get quotes for multiple symbols
// @access  Private
router.post('/quotes', auth, async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ message: 'Symbols array is required' });
    }

    const quotes = await Promise.all(
      symbols.map(async (symbolData) => {
        try {
          const symbol = typeof symbolData === 'string' ? symbolData : symbolData.symbol;
          const type = typeof symbolData === 'object' ? symbolData.type : 'stock';
          return await getMarketData(symbol, type);
        } catch (error) {
          return {
            symbol: typeof symbolData === 'string' ? symbolData : symbolData.symbol,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Failed to fetch market data' });
  }
});

// @route   GET /api/market-data/historical/:symbol
// @desc    Get historical data for a symbol
// @access  Private
router.get('/historical/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M', interval = 'daily' } = req.query;

    // Mock historical data - replace with real API
    const historicalData = [];
    const days = period === '1Y' ? 365 : period === '6M' ? 180 : period === '3M' ? 90 : 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        open: Math.random() * 1000 + 50,
        high: Math.random() * 1100 + 100,
        low: Math.random() * 900 + 25,
        close: Math.random() * 1000 + 50,
        volume: Math.floor(Math.random() * 1000000)
      });
    }

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        period,
        interval,
        data: historicalData
      }
    });
  } catch (error) {
    console.error('Get historical data error:', error);
    res.status(500).json({ message: 'Failed to fetch historical data' });
  }
});

// @route   GET /api/market-data/search
// @desc    Search for assets
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Mock search results - replace with real API
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'BTC', name: 'Bitcoin', type: 'cryptocurrency', exchange: 'Crypto' },
      { symbol: 'ETH', name: 'Ethereum', type: 'cryptocurrency', exchange: 'Crypto' }
    ].filter(item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      data: mockResults
    });
  } catch (error) {
    console.error('Search assets error:', error);
    res.status(500).json({ message: 'Failed to search assets' });
  }
});

// @route   GET /api/market-data/trending
// @desc    Get trending assets
// @access  Private
router.get('/trending', auth, async (req, res) => {
  try {
    const { type = 'all', limit = 10 } = req.query;

    // Mock trending data - replace with real API
    const trendingAssets = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', change: 2.5, volume: 50000000 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', change: -1.8, volume: 30000000 },
      { symbol: 'BTC', name: 'Bitcoin', type: 'cryptocurrency', change: 5.2, volume: 25000000 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', change: 1.2, volume: 20000000 },
      { symbol: 'ETH', name: 'Ethereum', type: 'cryptocurrency', change: 3.8, volume: 18000000 }
    ].slice(0, limit);

    res.json({
      success: true,
      data: trendingAssets
    });
  } catch (error) {
    console.error('Get trending assets error:', error);
    res.status(500).json({ message: 'Failed to fetch trending assets' });
  }
});

module.exports = router;
