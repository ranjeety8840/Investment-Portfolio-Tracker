import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && (
        <div className="mt-2 text-muted">{text}</div>
      )}
    </div>
  )
}

export default LoadingSpinner
