import React from 'react'

function ProgressBar({ percentage, completed, total }) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage || 0)))

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
          {completed !== undefined && total !== undefined
            ? `${completed} of ${total} lessons complete`
            : 'Progress'}
        </span>
        <span style={{
          fontSize: '14px', fontWeight: 700,
          color: pct === 100 ? '#10b981' : '#3b82f6',
        }}>
          {pct}%
        </span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '999px',
        height: '8px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: pct === 100
            ? 'linear-gradient(90deg, #10b981, #3b82f6)'
            : 'linear-gradient(90deg, #3b82f6, #6366f1)',
          borderRadius: '999px',
          transition: 'width 0.8s ease',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Shimmer effect */}
          {pct > 0 && pct < 100 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

export default ProgressBar
