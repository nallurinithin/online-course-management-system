import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, Calendar, CheckCircle } from 'lucide-react'

function CourseCard({ course, isEnrolled, progressPercent, onEnroll, showActions, onEdit, onDelete }) {
  const navigate = useNavigate()

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleCardClick = (e) => {
    // Don't navigate if action buttons were clicked
    if (e.target.closest('.card-actions')) return
    navigate(`/courses/${course.id}`)
  }

  const thumbnailGradients = [
    'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
  ]
  const gradientIndex = course.id ? course.id % thumbnailGradients.length : 0
  const thumbnailBg = thumbnailGradients[gradientIndex]

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(59,130,246,0.15)'
        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: '160px',
        background: course.thumbnail_url ? `url(${course.thumbnail_url}) center/cover` : thumbnailBg,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!course.thumbnail_url && (
          <BookOpen size={40} color="rgba(255,255,255,0.5)" />
        )}

        {/* Enrolled badge */}
        {isEnrolled && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(16,185,129,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16,185,129,0.5)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px', fontWeight: 700, color: 'white',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <CheckCircle size={11} />
            Enrolled
          </div>
        )}

        {/* Progress bar overlay if enrolled */}
        {isEnrolled && progressPercent !== undefined && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '3px',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              transition: 'width 0.8s ease',
            }} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <h3 style={{
            fontSize: '15px', fontWeight: 700, color: '#f1f5f9',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}>
            {course.title}
          </h3>
          <p style={{
            fontSize: '13px', color: '#64748b', lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {course.description || 'No description provided.'}
          </p>
        </div>

        {/* Instructor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {course.instructor_name?.[0]?.toUpperCase() || 'I'}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {course.instructor_name || 'Instructor'}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
              <Users size={12} />
              {course.enrolled_count || 0} students
            </span>
            {course.lesson_count !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                <BookOpen size={12} />
                {course.lesson_count} lessons
              </span>
            )}
          </div>

          {isEnrolled && progressPercent !== undefined && (
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              {progressPercent}%
            </span>
          )}

          {!isEnrolled && onEnroll && (
            <button
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={(e) => { e.stopPropagation(); onEnroll(course.id) }}
            >
              Enroll
            </button>
          )}
        </div>

        {/* Instructor Actions */}
        {showActions && (
          <div className="card-actions" style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
              onClick={(e) => { e.stopPropagation(); onEdit && onEdit(course.id) }}
            >
              Edit
            </button>
            <button
              className="btn-danger"
              style={{ padding: '8px 12px', fontSize: '12px' }}
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(course) }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseCard
