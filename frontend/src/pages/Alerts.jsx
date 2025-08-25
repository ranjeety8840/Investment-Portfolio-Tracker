import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    assetName: '',
    alertType: 'price_above',
    targetValue: ''
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts')
      setAlerts(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch alerts')
      console.error('Alerts fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    
    // Validate form data
    if (!newAlert.symbol.trim() || !newAlert.assetName.trim() || !newAlert.targetValue) {
      toast.error('Please fill in all required fields')
      return
    }

    const targetValue = parseFloat(newAlert.targetValue)
    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Please enter a valid target value')
      return
    }

    setCreateLoading(true)
    try {
      await axios.post('/api/alerts', {
        ...newAlert,
        targetValue
      })
      toast.success('Alert created successfully!')
      setShowCreateModal(false)
      setNewAlert({
        symbol: '',
        assetName: '',
        alertType: 'price_above',
        targetValue: ''
      })
      fetchAlerts()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create alert'
      toast.error(errorMessage)
      console.error('Create alert error:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleAlert = async (id, isActive) => {
    try {
      await axios.put(`/api/alerts/${id}`, { isActive: !isActive })
      toast.success(`Alert ${!isActive ? 'activated' : 'deactivated'}`)
      fetchAlerts()
    } catch (error) {
      toast.error('Failed to update alert')
      console.error('Update alert error:', error)
    }
  }

  const handleDeleteAlert = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await axios.delete(`/api/alerts/${id}`)
        toast.success('Alert deleted successfully!')
        fetchAlerts()
      } catch (error) {
        toast.error('Failed to delete alert')
        console.error('Delete alert error:', error)
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'price_above': return 'Price Above'
      case 'price_below': return 'Price Below'
      case 'percentage_change': return 'Percentage Change'
      case 'volume_spike': return 'Volume Spike'
      default: return type
    }
  }

  const getAlertStatusBadge = (alert) => {
    if (!alert.isActive) return 'secondary'
    if (alert.isTriggered) return 'success'
    return 'primary'
  }

  const getAlertStatusText = (alert) => {
    if (!alert.isActive) return 'Inactive'
    if (alert.isTriggered) return 'Triggered'
    return 'Active'
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
        <h1 className="h3 mb-0">Price Alerts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Alert
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Alert Type</th>
                    <th>Target Value</th>
                    <th>Current Value</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert._id}>
                      <td>
                        <div>
                          <strong>{alert.symbol}</strong>
                          <br />
                          <small className="text-muted">{alert.assetName}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {getAlertTypeLabel(alert.alertType)}
                        </span>
                      </td>
                      <td>
                        {alert.alertType.includes('price') 
                          ? formatCurrency(alert.targetValue)
                          : `${alert.targetValue}%`
                        }
                      </td>
                      <td>
                        {alert.currentValue > 0 
                          ? (alert.alertType.includes('price') 
                              ? formatCurrency(alert.currentValue)
                              : `${alert.currentValue}%`)
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <div>
                          <span className={`badge bg-${getAlertStatusBadge(alert)}`}>
                            {getAlertStatusText(alert)}
                          </span>
                          {alert.isTriggered && alert.triggeredAt && (
                            <>
                              <br />
                              <small className="text-muted">
                                Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className={`btn btn-outline-${alert.isActive ? 'warning' : 'success'}`}
                            onClick={() => handleToggleAlert(alert._id, alert.isActive)}
                            title={alert.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas fa-${alert.isActive ? 'pause' : 'play'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteAlert(alert._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-bell fa-4x text-muted mb-4"></i>
          <h4>No Alerts Set</h4>
          <p className="text-muted mb-4">
            Create price alerts to get notified when your assets reach target prices
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Create Your First Alert
          </button>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false)
            }
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Price Alert</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAlert}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="alertSymbol" className="form-label">Asset Symbol</label>
                    <input
                      type="text"
                      className="form-control"
                      id="alertSymbol"
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                      required
                      placeholder="e.g., AAPL, BTC"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="alertAssetName" className="form-label">Asset Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="alertAssetName"
                      value={newAlert.assetName}
                      onChange={(e) => setNewAlert({...newAlert, assetName: e.target.value})}
                      required
                      placeholder="e.g., Apple Inc., Bitcoin"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="alertType" className="form-label">Alert Type</label>
                    <select
                      className="form-select"
                      id="alertType"
                      value={newAlert.alertType}
                      onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value})}
                      required
                    >
                      <option value="price_above">Price Above</option>
                      <option value="price_below">Price Below</option>
                      <option value="percentage_change">Percentage Change</option>
                      <option value="volume_spike">Volume Spike</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="alertTargetValue" className="form-label">
                      Target Value 
                      {newAlert.alertType.includes('price') ? ' ($)' : ' (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="alertTargetValue"
                      value={newAlert.targetValue}
                      onChange={(e) => setNewAlert({...newAlert, targetValue: e.target.value})}
                      required
                      placeholder={newAlert.alertType.includes('price') ? 'Enter price' : 'Enter percentage'}
                    />
                  </div>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <small>
                      You'll receive notifications when the alert conditions are met.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Alert'
                    )}
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

export default Alerts
