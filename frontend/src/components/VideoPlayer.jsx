import React, { useState, useRef, useEffect } from 'react'
import { Play, CheckCircle, AlertCircle } from 'lucide-react'

function VideoPlayer({ videoUrl, lessonTitle, isCompleted, onComplete }) {
  const videoRef = useRef(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [videoUrl])

  const handleMarkComplete = async () => {
    if (isCompleted || isMarkingComplete) return
    setIsMarkingComplete(true)
    try {
      await onComplete()
    } finally {
      setIsMarkingComplete(false)
    }
  }

  if (!videoUrl) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* No video placeholder */}
        <div style={{
          height: '360px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.05))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Play size={30} color="#3b82f6" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 500 }}>Video not uploaded yet</p>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
              The instructor hasn't added a video for this lesson
            </p>
          </div>
        </div>

        {/* Mark complete section */}
        <div style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            {lessonTitle || 'Lesson'}
          </span>
          <button
            className={isCompleted ? 'btn-ghost' : 'btn-primary'}
            style={{ padding: '8px 18px', fontSize: '13px' }}
            onClick={handleMarkComplete}
            disabled={isCompleted || isMarkingComplete}
          >
            {isCompleted ? (
              <><CheckCircle size={14} style={{ color: '#10b981' }} /> Completed</>
            ) : isMarkingComplete ? (
              <><span className="spinner-sm" /> Saving...</>
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Video */}
      {hasError ? (
        <div style={{
          height: '360px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '12px', background: 'rgba(239,68,68,0.05)',
        }}>
          <AlertCircle size={40} color="#ef4444" />
          <p style={{ color: '#ef4444', fontSize: '14px' }}>Failed to load video</p>
          <p style={{ color: '#64748b', fontSize: '12px' }}>The video URL may have expired. Please refresh.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          style={{ width: '100%', maxHeight: '480px', display: 'block', background: '#000' }}
          onError={() => setHasError(true)}
        />
      )}

      {/* Below Video Controls */}
      <div style={{
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{lessonTitle || 'Lesson'}</p>
          {isCompleted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <CheckCircle size={12} color="#10b981" />
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>Completed</span>
            </div>
          )}
        </div>

        <button
          className={isCompleted ? 'btn-ghost' : 'btn-primary'}
          style={{ padding: '8px 18px', fontSize: '13px', opacity: isCompleted ? 0.7 : 1 }}
          onClick={handleMarkComplete}
          disabled={isCompleted || isMarkingComplete}
        >
          {isCompleted ? (
            <><CheckCircle size={14} /> Completed</>
          ) : isMarkingComplete ? (
            <><span className="spinner-sm" /> Saving...</>
          ) : (
            'Mark as Complete'
          )}
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
