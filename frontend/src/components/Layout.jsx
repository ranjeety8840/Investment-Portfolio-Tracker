import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/portfolios', icon: 'fas fa-briefcase', label: 'Portfolios' },
    { path: '/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
    { path: '/alerts', icon: 'fas fa-bell', label: 'Alerts' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' }
  ]

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className={`col-md-3 col-lg-2 d-md-block sidebar collapse ${sidebarOpen ? 'show' : ''}`}>
          <div className="position-sticky pt-3">
            <div className="text-center mb-4">
              <h4 className="text-white fw-bold">
                <i className="fas fa-chart-pie me-2"></i>
                Portfolio Tracker
              </h4>
            </div>
            
            <ul className="nav flex-column">
              {navItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              <div className="text-center text-white-50 mb-3">
                <small>Welcome, {user?.name}</small>
              </div>
              <button
                className="btn btn-outline-light btn-sm w-100"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
          {/* Mobile header */}
          <div className="d-md-none d-flex justify-content-between align-items-center py-3 border-bottom">
            <h5 className="mb-0">Portfolio Tracker</h5>
            <button
              className="btn btn-outline-primary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <div className="pt-3 pb-2 mb-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
