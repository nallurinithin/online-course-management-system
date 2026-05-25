import React from 'react'
import { BookOpen } from 'lucide-react'

function Loader({ text = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '20px',
    }}>
      {/* Spinning logo */}
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid rgba(59,130,246,0.15)',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute', inset: '10px',
          borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.15)',
          borderBottomColor: '#6366f1',
          animation: 'spin 0.7s linear infinite reverse',
        }} />
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={18} color="#3b82f6" />
        </div>
      </div>

      {text && (
        <p style={{
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 500,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          {text}
        </p>
      )}
    </div>
  )
}

export default Loader
