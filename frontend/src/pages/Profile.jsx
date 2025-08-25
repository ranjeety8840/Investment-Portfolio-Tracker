import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: {
      currency: user?.preferences?.currency || 'USD',
      riskTolerance: user?.preferences?.riskTolerance || 'moderate',
      notifications: {
        email: user?.preferences?.notifications?.email || true,
        priceAlerts: user?.preferences?.notifications?.priceAlerts || true,
        portfolioUpdates: user?.preferences?.notifications?.portfolioUpdates || true
      }
    }
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('preferences.notifications.')) {
      const notificationKey = name.split('.')[2]
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          notifications: {
            ...formData.preferences.notifications,
            [notificationKey]: checked
          }
        }
      })
    } else if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1]
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [prefKey]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile(formData)
    
    if (result.success) {
      toast.success('Profile updated successfully!')
    } else {
      toast.error(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div>
      <h1 className="h3 mb-4">Profile Settings</h1>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Personal Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Investment Preferences</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="currency" className="form-label">Preferred Currency</label>
                    <select
                      className="form-select"
                      id="currency"
                      name="preferences.currency"
                      value={formData.preferences.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="riskTolerance" className="form-label">Risk Tolerance</label>
                    <select
                      className="form-select"
                      id="riskTolerance"
                      name="preferences.riskTolerance"
                      value={formData.preferences.riskTolerance}
                      onChange={handleChange}
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Notification Preferences</h6>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      name="preferences.notifications.email"
                      checked={formData.preferences.notifications.email}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      Email Notifications
                    </label>
                    <div className="form-text">Receive general notifications via email</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="priceAlerts"
                      name="preferences.notifications.priceAlerts"
                      checked={formData.preferences.notifications.priceAlerts}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="priceAlerts">
                      Price Alerts
                    </label>
                    <div className="form-text">Get notified when price alerts are triggered</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="portfolioUpdates"
                      name="preferences.notifications.portfolioUpdates"
                      checked={formData.preferences.notifications.portfolioUpdates}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="portfolioUpdates">
                      Portfolio Updates
                    </label>
                    <div className="form-text">Receive updates about portfolio performance</div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Account Information</h5>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-user fa-2x text-white"></i>
                </div>
              </div>
              <div className="text-center">
                <h5>{user?.name}</h5>
                <p className="text-muted">{user?.email}</p>
                <span className={`badge bg-${user?.role === 'admin' ? 'danger' : 'primary'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <hr />
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Member since:</span>
                  <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                {user?.lastLogin && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Last login:</span>
                    <span>{new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Security</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-key me-2"></i>
                  Change Password
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-download me-2"></i>
                  Export Data
                </button>
                <button className="btn btn-outline-danger btn-sm">
                  <i className="fas fa-user-times me-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
