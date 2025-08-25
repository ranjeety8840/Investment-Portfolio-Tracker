import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchPortfolios()
  }, [])

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get('/api/portfolios')
      setPortfolios(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch portfolios')
      console.error('Portfolios fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePortfolio = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/portfolios', newPortfolio)
      toast.success('Portfolio created successfully!')
      setShowCreateModal(false)
      setNewPortfolio({ name: '', description: '' })
      fetchPortfolios()
    } catch (error) {
      toast.error('Failed to create portfolio')
      console.error('Create portfolio error:', error)
    }
  }

  const handleDeletePortfolio = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await axios.delete(`/api/portfolios/${id}`)
        toast.success('Portfolio deleted successfully!')
        fetchPortfolios()
      } catch (error) {
        toast.error('Failed to delete portfolio')
        console.error('Delete portfolio error:', error)
      }
    }
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">My Portfolios</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Portfolio
        </button>
      </div>

      {portfolios.length > 0 ? (
        <div className="row">
          {portfolios.map((portfolio) => (
            <div key={portfolio._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">{portfolio.name}</h5>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to={`/portfolios/${portfolio._id}`}
                          >
                            <i className="fas fa-eye me-2"></i>View Details
                          </Link>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleDeletePortfolio(portfolio._id)}
                          >
                            <i className="fas fa-trash me-2"></i>Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {portfolio.description && (
                    <p className="card-text text-muted small mb-3">
                      {portfolio.description}
                    </p>
                  )}

                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <h6 className="text-muted small mb-1">Total Value</h6>
                      <h5 className="mb-0">{formatCurrency(portfolio.totalValue)}</h5>
                    </div>
                    <div className="col-6">
                      <h6 className="text-muted small mb-1">Gain/Loss</h6>
                      <h5 className={`mb-0 ${portfolio.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(portfolio.totalGainLoss)}
                      </h5>
                      <small className={portfolio.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                        {formatPercentage(portfolio.totalGainLossPercentage)}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary">
                      {portfolio.assets.length} Assets
                    </span>
                    <small className="text-muted">
                      Updated {new Date(portfolio.lastUpdated).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <Link 
                    to={`/portfolios/${portfolio._id}`}
                    className="btn btn-outline-primary w-100"
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-briefcase fa-4x text-muted mb-4"></i>
          <h4>No Portfolios Yet</h4>
          <p className="text-muted mb-4">
            Create your first portfolio to start tracking your investments
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Create Your First Portfolio
          </button>
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Portfolio</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreatePortfolio}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="portfolioName" className="form-label">Portfolio Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="portfolioName"
                      value={newPortfolio.name}
                      onChange={(e) => setNewPortfolio({...newPortfolio, name: e.target.value})}
                      required
                      placeholder="e.g., Growth Portfolio, Retirement Fund"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="portfolioDescription" className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      id="portfolioDescription"
                      rows="3"
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                      placeholder="Brief description of your investment strategy"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Portfolio
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

export default Portfolios
