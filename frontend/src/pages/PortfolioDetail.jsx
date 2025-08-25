import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const PortfolioDetail = () => {
  const { id } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: '',
    averagePurchasePrice: '',
    sector: '',
    exchange: ''
  })

  useEffect(() => {
    fetchPortfolio()
  }, [id])

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`/api/portfolios/${id}`)
      setPortfolio(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch portfolio details')
      console.error('Portfolio fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAssets = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await axios.get(`/api/market-data/search?q=${query}`)
      setSearchResults(response.data.data)
    } catch (error) {
      console.error('Asset search error:', error)
    }
  }

  const handleAddAsset = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/portfolios/${id}/assets`, {
        ...newAsset,
        quantity: parseFloat(newAsset.quantity),
        averagePurchasePrice: parseFloat(newAsset.averagePurchasePrice)
      })
      toast.success('Asset added successfully!')
      setShowAddAssetModal(false)
      setNewAsset({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: '',
        averagePurchasePrice: '',
        sector: '',
        exchange: ''
      })
      fetchPortfolio()
    } catch (error) {
      toast.error('Failed to add asset')
      console.error('Add asset error:', error)
    }
  }

  const handleRemoveAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to remove this asset?')) {
      try {
        await axios.delete(`/api/portfolios/${id}/assets/${assetId}`)
        toast.success('Asset removed successfully!')
        fetchPortfolio()
      } catch (error) {
        toast.error('Failed to remove asset')
        console.error('Remove asset error:', error)
      }
    }
  }

  const selectAsset = (asset) => {
    setNewAsset({
      ...newAsset,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      exchange: asset.exchange
    })
    setSearchResults([])
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="text-center py-5">
        <h4>Portfolio not found</h4>
        <Link to="/portfolios" className="btn btn-primary">
          Back to Portfolios
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/portfolios">Portfolios</Link>
              </li>
              <li className="breadcrumb-item active">{portfolio.name}</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-muted">{portfolio.description}</p>
          )}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddAssetModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add Asset
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Value</h6>
              <h4>{formatCurrency(portfolio.totalValue)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Investment</h6>
              <h4>{formatCurrency(portfolio.totalInvestment)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className={`card stat-card ${portfolio.totalGainLoss >= 0 ? 'success' : 'danger'}`}>
            <div className="card-body text-center">
              <h6 className="text-muted">Gain/Loss</h6>
              <h4 className={portfolio.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(portfolio.totalGainLoss)}
              </h4>
              <small className={portfolio.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                {formatPercentage(portfolio.totalGainLossPercentage)}
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h6 className="text-muted">Assets</h6>
              <h4>{portfolio.assets.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Portfolio Assets</h5>
        </div>
        <div className="card-body">
          {portfolio.assets.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Avg. Price</th>
                    <th>Current Price</th>
                    <th>Value</th>
                    <th>Gain/Loss</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.assets.map((asset) => {
                    const currentValue = asset.quantity * (asset.currentPrice || asset.averagePurchasePrice)
                    const investmentValue = asset.quantity * asset.averagePurchasePrice
                    const gainLoss = currentValue - investmentValue
                    const gainLossPercentage = investmentValue > 0 ? (gainLoss / investmentValue) * 100 : 0

                    return (
                      <tr key={asset._id}>
                        <td>
                          <div>
                            <strong>{asset.symbol}</strong>
                            <br />
                            <small className="text-muted">{asset.name}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {asset.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>{asset.quantity}</td>
                        <td>{formatCurrency(asset.averagePurchasePrice)}</td>
                        <td>{formatCurrency(asset.currentPrice || asset.averagePurchasePrice)}</td>
                        <td>{formatCurrency(currentValue)}</td>
                        <td>
                          <span className={gainLoss >= 0 ? 'text-success' : 'text-danger'}>
                            {formatCurrency(gainLoss)}
                            <br />
                            <small>{formatPercentage(gainLossPercentage)}</small>
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveAsset(asset._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
              <h5>No Assets Yet</h5>
              <p className="text-muted">Add your first asset to start tracking this portfolio</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddAssetModal(true)}
              >
                Add Asset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Asset to Portfolio</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddAssetModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddAsset}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetSymbol" className="form-label">Symbol</label>
                      <input
                        type="text"
                        className="form-control"
                        id="assetSymbol"
                        value={newAsset.symbol}
                        onChange={(e) => {
                          setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})
                          searchAssets(e.target.value)
                        }}
                        required
                        placeholder="e.g., AAPL, BTC"
                      />
                      {searchResults.length > 0 && (
                        <div className="list-group mt-2">
                          {searchResults.slice(0, 5).map((result) => (
                            <button
                              key={result.symbol}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() => selectAsset(result)}
                            >
                              <strong>{result.symbol}</strong> - {result.name}
                              <br />
                              <small className="text-muted">{result.type} • {result.exchange}</small>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetName" className="form-label">Asset Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="assetName"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                        required
                        placeholder="e.g., Apple Inc."
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetType" className="form-label">Asset Type</label>
                      <select
                        className="form-select"
                        id="assetType"
                        value={newAsset.type}
                        onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                        required
                      >
                        <option value="stock">Stock</option>
                        <option value="cryptocurrency">Cryptocurrency</option>
                        <option value="bond">Bond</option>
                        <option value="etf">ETF</option>
                        <option value="mutual_fund">Mutual Fund</option>
                        <option value="commodity">Commodity</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetQuantity" className="form-label">Quantity</label>
                      <input
                        type="number"
                        step="0.000001"
                        className="form-control"
                        id="assetQuantity"
                        value={newAsset.quantity}
                        onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                        required
                        placeholder="Number of shares/units"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetPrice" className="form-label">Average Purchase Price</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="assetPrice"
                        value={newAsset.averagePurchasePrice}
                        onChange={(e) => setNewAsset({...newAsset, averagePurchasePrice: e.target.value})}
                        required
                        placeholder="Price per share/unit"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="assetSector" className="form-label">Sector (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="assetSector"
                        value={newAsset.sector}
                        onChange={(e) => setNewAsset({...newAsset, sector: e.target.value})}
                        placeholder="e.g., Technology, Healthcare"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddAssetModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioDetail
