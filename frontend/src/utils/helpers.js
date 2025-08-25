// Utility functions for the application

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatPercentage = (percentage, decimals = 2) => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(decimals)}%`
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateGainLoss = (currentValue, investmentValue) => {
  const gainLoss = currentValue - investmentValue
  const percentage = investmentValue > 0 ? (gainLoss / investmentValue) * 100 : 0
  return { gainLoss, percentage }
}

export const getAssetTypeColor = (type) => {
  const colors = {
    stock: 'primary',
    cryptocurrency: 'warning',
    bond: 'success',
    etf: 'info',
    mutual_fund: 'secondary',
    commodity: 'dark'
  }
  return colors[type] || 'secondary'
}

export const getRiskLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'low': return 'success'
    case 'medium': return 'warning'
    case 'high': return 'danger'
    default: return 'secondary'
  }
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const generateRandomColor = () => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
