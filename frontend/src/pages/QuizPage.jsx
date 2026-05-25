import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trophy, XCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { getQuiz, getMyResult, submitAttempt } from '../services/quizService'
import QuizWidget from '../components/QuizWidget'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

function QuizPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [quizRes, attemptRes] = await Promise.allSettled([
          getQuiz(null).catch(() => ({ data: null })),
          getMyResult(quizId),
        ])

        // Try to get quiz by ID directly
        try {
          const res = await import('../services/api').then(m => m.default.get(`/api/quizzes/${quizId}`))
          setQuiz(res.data)
        } catch {
          // fallback - quiz not found
        }

        if (attemptRes.status === 'fulfilled' && attemptRes.value.data) {
          setAttempt(attemptRes.value.data)
        }
      } catch {
        toast.error('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId])

  const handleSubmit = async (answers) => {
    try {
      await submitAttempt(quizId, answers)
      const res = await getMyResult(quizId)
      setAttempt(res.data)
      if (res.data?.passed) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      toast.success('Quiz submitted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit quiz')
    }
  }

  if (loading) return <Loader />

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none',
          zIndex: 5000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444'][i % 5],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `confetti${i % 3} 2s ease-out forwards`,
              opacity: 0,
            }} />
          ))}
          <div style={{
            background: 'rgba(16,185,129,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px 48px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎉</div>
            <p style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>Quiz Passed!</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Excellent work!</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confetti0 { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(-200px) rotate(360deg); } }
        @keyframes confetti1 { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(-150px) rotate(-360deg); } }
        @keyframes confetti2 { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(-100px) rotate(180deg); } }
      `}</style>

      <div className="page-container" style={{ padding: '40px 24px', maxWidth: '720px' }}>
        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            className="btn-ghost"
            style={{ padding: '8px 12px', fontSize: '13px' }}
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <ChevronLeft size={14} /> Back to Course
          </button>
        </div>

        {/* Score Card (if attempted) */}
        {attempt && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              padding: '28px',
              borderRadius: '16px',
              background: attempt.passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${attempt.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
            }}>
              {/* Circular Score */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '100px', height: '100px',
                  borderRadius: '50%',
                  border: `4px solid ${attempt.passed ? '#10b981' : '#ef4444'}`,
                  background: attempt.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: attempt.passed ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                    {attempt.score || 0}
                  </span>
                  <span style={{ fontSize: '11px', color: attempt.passed ? '#10b981' : '#ef4444', opacity: 0.8 }}>
                    / {attempt.total_questions || quiz?.questions?.length || 0}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
                    {quiz?.title || 'Quiz Result'}
                  </h2>
                  <span style={{
                    padding: '3px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    ...(attempt.passed
                      ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                      : { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' })
                  }}>
                    {attempt.passed ? <><Trophy size={12} /> PASSED</> : <><XCircle size={12} /> FAILED</>}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Score: {attempt.score} out of {attempt.total_questions || 0} correct
                  {' '}({Math.round(((attempt.score || 0) / (attempt.total_questions || 1)) * 100)}%)
                </p>
                {!attempt.passed && (
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Review the lesson material and try again!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Widget */}
        {quiz ? (
          <QuizWidget
            quiz={quiz}
            existingAttempt={attempt}
            onSubmit={handleSubmit}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <p style={{ fontSize: '16px' }}>Quiz not found or not available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPage
