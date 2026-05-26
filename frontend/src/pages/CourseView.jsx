import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Users, BookOpen, Lock } from 'lucide-react'
import {
  getCourse, getLessons, getProgress, enroll, completeLesson, incompleteLesson
} from '../services/courseService'
import { getQuiz, getMyResult, submitAttempt } from '../services/quizService'
import { getViewUrl } from '../services/uploadService'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import LessonSidebar from '../components/LessonSidebar'
import ProgressBar from '../components/ProgressBar'
import QuizWidget from '../components/QuizWidget'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

function CourseView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [progress, setProgress] = useState([])
  const [videoUrl, setVideoUrl] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [quizAttempt, setQuizAttempt] = useState(null)
  const [quizzesMap, setQuizzesMap] = useState({})
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)

  const isStudent = user?.role === 'student'
  const isInstructor = user?.role === 'instructor'

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        getCourse(id),
        getLessons(id),
      ])
      setCourse(courseRes.data)
      const allLessons = lessonsRes.data || []
      setLessons(allLessons)

      // Check enrollment & progress
      if (isStudent) {
        try {
          const progressRes = await getProgress(id)
          setProgress(progressRes.data || [])
          setIsEnrolled(true)
        } catch {
          setIsEnrolled(false)
        }
      } else {
        // Instructors can view their own courses
        setIsEnrolled(true)
      }

      // Fetch quizzes for all lessons
      const qMap = {}
      await Promise.allSettled(
        allLessons.map(async (lesson) => {
          try {
            const qRes = await getQuiz(lesson.id)
            if (qRes.data) qMap[lesson.id] = qRes.data
          } catch { /* no quiz */ }
        })
      )
      setQuizzesMap(qMap)

      // Select first lesson
      if (allLessons.length > 0) {
        selectLesson(allLessons[0], qMap, [])
      }
    } catch (err) {
      toast.error('Failed to load course')
    } finally {
      setLoading(false)
    }
  }, [id, isStudent])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const selectLesson = async (lesson, qMap = quizzesMap, prog = progress) => {
    setCurrentLesson(lesson)
    setVideoUrl(null)
    setQuiz(null)
    setQuizAttempt(null)

    // Load video URL
    if (lesson.video_s3_key) {
      try {
        const urlRes = await getViewUrl(lesson.video_s3_key)
        setVideoUrl(urlRes.data?.view_url || urlRes.data?.url || null)
      } catch {
        setVideoUrl(null)
      }
    }

    // Load quiz
    const lessonQuiz = qMap[lesson.id]
    if (lessonQuiz) {
      setQuiz(lessonQuiz)
      if (isStudent) {
        try {
          const attemptRes = await getMyResult(lessonQuiz.id)
          setQuizAttempt(attemptRes.data)
        } catch {
          setQuizAttempt(null)
        }
      }
    }
  }

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enroll(id)
      setIsEnrolled(true)
      toast.success('Enrolled successfully! 🎉')
      const progressRes = await getProgress(id)
      setProgress(progressRes.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const handleComplete = async () => {
    if (!currentLesson) return
    try {
      await completeLesson(currentLesson.id)
      const progressRes = await getProgress(id)
      setProgress(progressRes.data || [])
      toast.success('Lesson marked as complete! ✓')
    } catch {
      toast.error('Failed to mark lesson complete')
    }
  }

  const handleQuizSubmit = async (answers) => {
    if (!quiz) return
    try {
      await submitAttempt(quiz.id, answers)
      const attemptRes = await getMyResult(quiz.id)
      setQuizAttempt(attemptRes.data)
      toast.success('Quiz submitted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit quiz')
    }
  }

  const isLessonCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId)
  const completedCount = progress.length
  const totalLessons = lessons.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const currentIdx = lessons.findIndex(l => l.id === currentLesson?.id)
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null

  if (loading) return <Loader />

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Course Header */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
      }}>
        <div className="page-container" style={{ maxWidth: '1400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {course?.title || 'Course'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  By {course?.instructor_name || 'Instructor'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={11} /> {course?.enrolled_count || 0} students
                </span>
              </div>
            </div>
            {isEnrolled && isStudent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{progressPct}% complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ maxWidth: '1400px', padding: '24px' }}>
        {!isEnrolled && isStudent ? (
          /* Enrollment CTA */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 24px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={32} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
              Enroll to Access This Course
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '400px', lineHeight: 1.6, marginBottom: '32px' }}>
              {course?.description || 'Join this course to access all lessons, videos, and quizzes.'}
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#94a3b8' }}>
                <BookOpen size={14} /> {lessons.length} lessons
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: '16px', padding: '14px 36px' }}
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? <><span className="spinner-sm" /> Enrolling...</> : 'Enroll for Free'}
            </button>
          </div>
        ) : (
          /* Main Course Layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '24px',
            alignItems: 'start',
          }} className="course-layout">
            {/* Main Content */}
            <div>
              {/* Progress Bar (student only) */}
              {isStudent && (
                <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                  <ProgressBar percentage={progressPct} completed={completedCount} total={totalLessons} />
                </div>
              )}

              {/* Video Player */}
              <div style={{ marginBottom: '20px' }}>
                <VideoPlayer
                  videoUrl={videoUrl}
                  lessonTitle={currentLesson?.title}
                  isCompleted={currentLesson ? isLessonCompleted(currentLesson.id) : false}
                  onComplete={handleComplete}
                />
              </div>

              {/* Lesson Info */}
              {currentLesson && (
                <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                    {currentLesson.title}
                  </h2>
                  {currentLesson.description && (
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7 }}>
                      {currentLesson.description}
                    </p>
                  )}
                </div>
              )}

              {/* Lesson Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
                <button
                  className="btn-ghost"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && selectLesson(prevLesson)}
                  style={{ flex: 1, justifyContent: 'center', maxWidth: '200px' }}
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <button
                  className="btn-primary"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson)}
                  style={{ flex: 1, justifyContent: 'center', maxWidth: '200px' }}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>

              {/* Quiz */}
              {quiz && isStudent && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '14px' }}>
                    Lesson Quiz
                  </h3>
                  <QuizWidget
                    quiz={quiz}
                    existingAttempt={quizAttempt}
                    onSubmit={handleQuizSubmit}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <LessonSidebar
                lessons={lessons}
                currentLessonId={currentLesson?.id}
                progress={progress}
                onSelectLesson={(lesson) => selectLesson(lesson)}
                quizzes={quizzesMap}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .course-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CourseView
