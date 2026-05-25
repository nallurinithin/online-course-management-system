import React, { useState } from 'react'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, HelpCircle, Trophy } from 'lucide-react'

function QuizWidget({ quiz, onSubmit, existingAttempt }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!quiz) return null

  const questions = quiz.questions || []
  const totalQ = questions.length

  // Results View
  if (existingAttempt) {
    const passed = existingAttempt.passed
    const score = existingAttempt.score
    const total = existingAttempt.total_questions || totalQ
    const pct = Math.round((score / total) * 100)

    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          borderBottom: `1px solid ${passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            border: `3px solid ${passed ? '#10b981' : '#ef4444'}`,
            background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: passed ? '#10b981' : '#ef4444' }}>{pct}%</span>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
              {quiz.title || 'Quiz Results'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '3px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: passed ? '#10b981' : '#ef4444',
                border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {passed ? <><Trophy size={11} /> PASSED</> : <><XCircle size={11} /> FAILED</>}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                {score} / {total} correct
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map((q, idx) => {
              const userAnswer = existingAttempt.answers?.[q.id] || existingAttempt.answers?.[idx]
              const correct = q.correct_answer
              const isCorrect = userAnswer === correct

              return (
                <div key={q.id || idx} style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {isCorrect
                      ? <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      : <XCircle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        Q{idx + 1}. {q.question_text}
                      </p>
                      <p style={{ fontSize: '12px', color: isCorrect ? '#10b981' : '#ef4444' }}>
                        Your answer: {userAnswer || 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>
                          Correct: {correct}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Quiz Form
  const currentQuestion = questions[currentQ]
  const allAnswered = questions.every((q, idx) => answers[q.id || idx] !== undefined)
  const answeredCount = Object.keys(answers).length

  const optionLabels = ['A', 'B', 'C', 'D']

  const handleSelect = (value) => {
    const key = currentQuestion.id || currentQ
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!allAnswered) return
    setIsSubmitting(true)
    try {
      await onSubmit(answers)
    } finally {
      setIsSubmitting(false)
      setShowConfirm(false)
    }
  }

  const currentAnswerKey = currentQuestion?.id || currentQ
  const selectedAnswer = answers[currentAnswerKey]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HelpCircle size={18} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{quiz.title || 'Quiz'}</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>{totalQ} questions · {answeredCount}/{totalQ} answered</p>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600 }}>
          Q{currentQ + 1} of {totalQ}
        </span>
      </div>

      {/* Progress Track */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%',
          width: `${((currentQ + 1) / totalQ) * 100}%`,
          background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question */}
      <div style={{ padding: '28px 24px' }}>
        {/* Question dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {questions.map((q, idx) => {
            const key = q.id || idx
            const isAnswered = answers[key] !== undefined
            return (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${idx === currentQ ? '#6366f1' : isAnswered ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: idx === currentQ ? 'rgba(99,102,241,0.2)' : isAnswered ? 'rgba(16,185,129,0.1)' : 'transparent',
                  color: idx === currentQ ? '#6366f1' : isAnswered ? '#10b981' : '#64748b',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        <p style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '20px', lineHeight: 1.5 }}>
          {currentQuestion?.question_text}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(currentQuestion?.options || []).map((option, idx) => {
            const label = optionLabels[idx] || String.fromCharCode(65 + idx)
            const isSelected = selectedAnswer === option || selectedAnswer === label

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#f1f5f9' }}}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}}
              >
                <span style={{
                  width: '28px', height: '28px', flexShrink: 0,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                  background: isSelected ? 'rgba(99,102,241,0.2)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  color: isSelected ? '#6366f1' : '#64748b',
                }}>
                  {label}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
      }}>
        <button
          className="btn-ghost"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
        >
          <ChevronLeft size={15} /> Prev
        </button>

        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {answeredCount} of {totalQ} answered
        </span>

        {currentQ < totalQ - 1 ? (
          <button
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setCurrentQ(Math.min(totalQ - 1, currentQ + 1))}
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
            disabled={!allAnswered || isSubmitting}
            onClick={() => setShowConfirm(true)}
          >
            {isSubmitting ? <><span className="spinner-sm" /> Submitting...</> : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: '#0d1526',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px', width: '100%',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#f1f5f9' }}>
              Submit Quiz?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              You answered {answeredCount} of {totalQ} questions. Once submitted, you cannot change your answers.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowConfirm(false)}>
                Review
              </button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <><span className="spinner-sm" /> Submitting...</> : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizWidget
