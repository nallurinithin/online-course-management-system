import React from 'react'
import { CheckCircle, HelpCircle, PlayCircle } from 'lucide-react'

function LessonSidebar({ lessons, currentLessonId, progress, onSelectLesson, quizzes }) {
  const completedIds = new Set((progress || []).map(p => p.lesson_id))

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content',
      maxHeight: '80vh',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
          Course Content
        </h3>
        <span style={{
          fontSize: '11px', color: '#64748b', fontWeight: 500,
          background: 'rgba(255,255,255,0.06)',
          padding: '2px 8px', borderRadius: '999px',
        }}>
          {completedIds.size}/{lessons?.length || 0} done
        </span>
      </div>

      {/* Lessons List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {(!lessons || lessons.length === 0) ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No lessons yet
          </div>
        ) : (
          lessons.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id)
            const isCurrent = lesson.id === currentLessonId
            const hasQuiz = quizzes && quizzes[lesson.id]

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  background: isCurrent ? 'rgba(59,130,246,0.08)' : 'transparent',
                  borderLeft: `3px solid ${isCurrent ? '#3b82f6' : 'transparent'}`,
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Status Icon */}
                <div style={{ flexShrink: 0, marginTop: '1px' }}>
                  {isCompleted ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : isCurrent ? (
                    <PlayCircle size={16} color="#3b82f6" />
                  ) : (
                    <div style={{
                      width: '16px', height: '16px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? '#f1f5f9' : isCompleted ? '#94a3b8' : '#cbd5e1',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {lesson.title}
                    </p>
                    {hasQuiz && (
                      <HelpCircle size={13} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#475569' }}>Lesson {idx + 1}</span>
                    {hasQuiz && (
                      <span style={{
                        fontSize: '10px', color: '#6366f1',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        padding: '1px 6px', borderRadius: '999px',
                        fontWeight: 600,
                      }}>
                        Quiz
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default LessonSidebar
