import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Analytics = () => {
  const [portfolios, setPortfolios] = useState([])
  const [selectedPortfolio, setSelectedPortfolio] = useState('')
  const [performance, setPerformance] = useState(null)
  const [diversification, setDiversification] = useState(null)
  const [riskAnalysis, setRiskAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPortfolios()
  }, [])

  useEffect(() => {
    if (selectedPortfolio) {
      fetchAnalytics()
    }
  }, [selectedPortfolio])

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get('/api/portfolios')
      setPortfolios(response.data.data)
      if (response.data.data.length > 0) {
        setSelectedPortfolio(response.data.data[0]._id)
      }
    } catch (error) {
      toast.error('Failed to fetch portfolios')
      console.error('Portfolios fetch error:', error)
    }
  }

  const fetchAnalytics = async () => {
    if (!selectedPortfolio) return

    setLoading(true)
    try {
      const [performanceRes, diversificationRes, riskRes] = await Promise.all([
        axios.get(`/api/analytics/portfolio/${selectedPortfolio}/performance`),
        axios.get(`/api/analytics/portfolio/${selectedPortfolio}/diversification`),
        axios.get(`/api/analytics/portfolio/${selectedPortfolio}/risk`)
      ])

      setPerformance(performanceRes.data.data)
      setDiversification(diversificationRes.data.data)
      setRiskAnalysis(riskRes.data.data)
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

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'success'
      case 'Medium': return 'warning'
      case 'High': return 'danger'
      default: return 'secondary'
    }
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-chart-line fa-4x text-muted mb-4"></i>
        <h4>No Portfolios for Analytics</h4>
        <p className="text-muted mb-4">
          Create a portfolio with assets to view detailed analytics
        </p>
        <Link to="/portfolios" className="btn btn-primary">
          Create Portfolio
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Portfolio Analytics</h1>
        <div className="d-flex align-items-center">
          <label htmlFor="portfolioSelect" className="form-label me-2 mb-0">
            Select Portfolio:
          </label>
          <select
            id="portfolioSelect"
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
          >
            {portfolios.map((portfolio) => (
              <option key={portfolio._id} value={portfolio._id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Performance Overview */}
          {performance && (
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Total Value</h6>
                    <h4>{formatCurrency(performance.totalValue)}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={`card stat-card ${performance.totalGainLoss >= 0 ? 'success' : 'danger'}`}>
                  <div className="card-body text-center">
                    <h6 className="text-muted">Total Gain/Loss</h6>
                    <h4 className={performance.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(performance.totalGainLoss)}
                    </h4>
                    <small className={performance.totalGainLoss >= 0 ? 'text-success' : 'text-danger'}>
                      {formatPercentage(performance.totalGainLossPercentage)}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Assets</h6>
                    <h4>{performance.assetCount}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={`card stat-card ${getRiskColor(riskAnalysis?.riskLevel)}`}>
                  <div className="card-body text-center">
                    <h6 className="text-muted">Risk Level</h6>
                    <h4 className={`text-${getRiskColor(riskAnalysis?.riskLevel)}`}>
                      {riskAnalysis?.riskLevel || 'N/A'}
                    </h4>
                    <small className="text-muted">
                      Score: {riskAnalysis?.riskScore || 0}/100
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            {/* Top/Worst Performers */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Performance Leaders</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">
                        <i className="fas fa-arrow-up me-2"></i>Top Performers
                      </h6>
                      {performance?.topPerformers?.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {performance.topPerformers.map((asset, index) => (
                            <div key={index} className="list-group-item border-0 px-0">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>{asset.symbol}</strong>
                                  <br />
                                  <small className="text-muted">{asset.name}</small>
                                </div>
                                <div className="text-end">
                                  <span className="text-success">
                                    {formatPercentage(asset.gainLossPercentage)}
                                  </span>
                                  <br />
                                  <small className="text-success">
                                    {formatCurrency(asset.gainLoss)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No data available</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-danger mb-3">
                        <i className="fas fa-arrow-down me-2"></i>Worst Performers
                      </h6>
                      {performance?.worstPerformers?.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {performance.worstPerformers.map((asset, index) => (
                            <div key={index} className="list-group-item border-0 px-0">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>{asset.symbol}</strong>
                                  <br />
                                  <small className="text-muted">{asset.name}</small>
                                </div>
                                <div className="text-end">
                                  <span className="text-danger">
                                    {formatPercentage(asset.gainLossPercentage)}
                                  </span>
                                  <br />
                                  <small className="text-danger">
                                    {formatCurrency(asset.gainLoss)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diversification Analysis */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Diversification Analysis</h5>
                </div>
                <div className="card-body">
                  {diversification ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="d-inline-block position-relative">
                          <div 
                            className="progress mx-auto" 
                            style={{ width: '120px', height: '120px', borderRadius: '50%' }}
                          >
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ 
                                width: `${diversification.diversificationScore}%`,
                                borderRadius: '50%'
                              }}
                            ></div>
                          </div>
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <h4 className="mb-0">{diversification.diversificationScore}</h4>
                            <small className="text-muted">Score</small>
                          </div>
                        </div>
                      </div>

                      <h6 className="mb-3">Asset Type Distribution</h6>
                      {Object.entries(diversification.assetTypeDistribution).map(([type, percentage]) => (
                        <div key={type} className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small>{type.replace('_', ' ').toUpperCase()}</small>
                            <small>{percentage.toFixed(1)}%</small>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}

                      <div className="mt-3">
                        <h6 className="mb-2">Recommendations</h6>
                        <ul className="list-unstyled mb-0">
                          {diversification.recommendations.map((rec, index) => (
                            <li key={index} className="mb-1">
                              <i className="fas fa-lightbulb text-warning me-2"></i>
                              <small>{rec}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">No diversification data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          {riskAnalysis && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Risk Analysis</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h6 className="mb-3">Risk Factors by Asset</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Asset</th>
                            <th>Type</th>
                            <th>Risk Weight</th>
                            <th>Allocation</th>
                            <th>Risk Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {riskAnalysis.riskFactors.map((factor, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{factor.symbol}</strong>
                                <br />
                                <small className="text-muted">{factor.name}</small>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {factor.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div className="progress" style={{ width: '60px', height: '6px' }}>
                                  <div 
                                    className={`progress-bar bg-${factor.riskWeight > 0.7 ? 'danger' : factor.riskWeight > 0.4 ? 'warning' : 'success'}`}
                                    style={{ width: `${factor.riskWeight * 100}%` }}
                                  ></div>
                                </div>
                                <small>{(factor.riskWeight * 100).toFixed(0)}%</small>
                              </td>
                              <td>{factor.allocation.toFixed(1)}%</td>
                              <td>
                                <span className={`text-${factor.riskWeight > 0.7 ? 'danger' : factor.riskWeight > 0.4 ? 'warning' : 'success'}`}>
                                  {(factor.riskWeight * factor.allocation / 100 * 100).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-3">Risk Recommendations</h6>
                    <ul className="list-unstyled">
                      {riskAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="mb-2">
                          <i className="fas fa-shield-alt text-info me-2"></i>
                          <small>{rec}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Analytics
