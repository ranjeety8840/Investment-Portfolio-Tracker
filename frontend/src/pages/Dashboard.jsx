import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/overview')
      setAnalytics(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch analytics data')
      console.error('Analytics fetch error:', error)
    } finally {
      setLoading(false)
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

  const { summary, recentActivity, portfolios } = analytics || {}

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Dashboard</h1>
        <Link to="/portfolios" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Portfolio
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Total Value</h6>
                  <h4 className="mb-0">{formatCurrency(summary?.totalValue || 0)}</h4>
                </div>
                <div className="text-primary">
                  <i className="fas fa-dollar-sign fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className={`card stat-card ${summary?.totalGainLoss >= 0 ? 'success' : 'danger'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Total Gain/Loss</h6>
                  <h4 className={`mb-0 ${summary?.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(summary?.totalGainLoss || 0)}
                  </h4>
                  <small className={summary?.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                    {formatPercentage(summary?.totalGainLossPercentage || 0)}
                  </small>
                </div>
                <div className={summary?.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                  <i className={`fas fa-arrow-${summary?.totalGainLoss >= 0 ? 'up' : 'down'} fa-2x`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Portfolios</h6>
                  <h4 className="mb-0">{summary?.portfolioCount || 0}</h4>
                </div>
                <div className="text-info">
                  <i className="fas fa-briefcase fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Total Assets</h6>
                  <h4 className="mb-0">{summary?.totalAssets || 0}</h4>
                </div>
                <div className="text-warning">
                  <i className="fas fa-chart-pie fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Portfolios Overview */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Portfolios</h5>
              <Link to="/portfolios" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {portfolios && portfolios.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Portfolio</th>
                        <th>Value</th>
                        <th>Gain/Loss</th>
                        <th>Assets</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolios.map((portfolio) => (
                        <tr key={portfolio.id}>
                          <td>
                            <strong>{portfolio.name}</strong>
                          </td>
                          <td>{formatCurrency(portfolio.totalValue)}</td>
                          <td>
                            <span className={portfolio.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(portfolio.totalGainLoss)}
                              <br />
                              <small>{formatPercentage(portfolio.totalGainLossPercentage)}</small>
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{portfolio.assetCount}</span>
                          </td>
                          <td>
                            <Link 
                              to={`/portfolios/${portfolio.id}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                  <h5>No Portfolios Yet</h5>
                  <p className="text-muted">Create your first portfolio to start tracking investments</p>
                  <Link to="/portfolios" className="btn btn-primary">
                    Create Portfolio
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <span className={`badge ${activity.type === 'buy' ? 'bg-success' : 'bg-danger'} me-2`}>
                              {activity.type.toUpperCase()}
                            </span>
                            {activity.symbol}
                          </h6>
                          <p className="mb-1 small text-muted">{activity.assetName}</p>
                          <small className="text-muted">
                            {activity.quantity} @ {formatCurrency(activity.price)}
                          </small>
                        </div>
                        <small className="text-muted">
                          {new Date(activity.executedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="fas fa-history fa-2x text-muted mb-2"></i>
                  <p className="text-muted mb-0">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
