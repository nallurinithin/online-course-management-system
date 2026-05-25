import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, Plus, Edit2, Trash2, TrendingUp,
  Award, GraduationCap, PlayCircle, CheckCircle, BarChart2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getCourses, deleteCourse, getMyEnrollments, getProgressPercentage
} from '../services/courseService'
import CourseCard from '../components/CourseCard'
import ProgressBar from '../components/ProgressBar'
import toast from 'react-hot-toast'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isInstructor = user?.role === 'instructor'
  const isStudent = user?.role === 'student'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (isInstructor) {
        const res = await getCourses()
        const all = res.data || []
        const mine = all.filter(c => c.instructor_id === user.id || c.instructor_name === user.name)
        setCourses(mine.length > 0 ? mine : all)
      } else if (isStudent) {
        const res = await getMyEnrollments()
        const enrolled = res.data || []
        setEnrollments(enrolled)

        // Fetch progress for each enrolled course
        const progMap = {}
        await Promise.allSettled(
          enrolled.map(async (e) => {
            try {
              const pr = await getProgressPercentage(e.course_id || e.id)
              progMap[e.course_id || e.id] = pr.data?.percentage || 0
            } catch {
              progMap[e.course_id || e.id] = 0
            }
          })
        )
        setProgressMap(progMap)
      }
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, isInstructor, isStudent])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCourse(deleteTarget.id)
      toast.success('Course deleted')
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete course')
    } finally {
      setDeleting(false)
    }
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)
  const totalLessons = courses.reduce((sum, c) => sum + (c.lesson_count || 0), 0)
  const completedCourses = enrollments.filter(e => (progressMap[e.course_id || e.id] || 0) === 100).length
  const avgProgress = enrollments.length > 0
    ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / enrollments.length)
    : 0

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div className="page-container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '36px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                {isInstructor ? 'Manage your courses and track student engagement'
                  : 'Continue your learning journey'}
              </p>
              <span style={{
                padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                ...(isInstructor
                  ? { background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }
                  : { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' })
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          {isInstructor && (
            <button
              className="btn-primary"
              onClick={() => navigate('/courses/create')}
            >
              <Plus size={16} /> Create New Course
            </button>
          )}
        </div>

        {/* Stats Row */}
        {isInstructor ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'My Courses', value: courses.length, icon: <BookOpen size={20} />, color: '#3b82f6' },
              { label: 'Total Students', value: totalStudents, icon: <Users size={20} />, color: '#10b981' },
              { label: 'Total Lessons', value: totalLessons, icon: <PlayCircle size={20} />, color: '#6366f1' },
            ].map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'Enrolled Courses', value: enrollments.length, icon: <BookOpen size={20} />, color: '#3b82f6' },
              { label: 'Avg. Progress', value: `${avgProgress}%`, icon: <BarChart2 size={20} />, color: '#6366f1' },
              { label: 'Completed', value: completedCourses, icon: <CheckCircle size={20} />, color: '#10b981' },
            ].map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                height: '300px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : isInstructor ? (
          /* Instructor: My Courses */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>My Courses</h2>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={48} style={{ opacity: 0.3 }} />}
                title="No courses yet"
                description="Create your first course to start teaching students!"
                action={<button className="btn-primary" onClick={() => navigate('/courses/create')}><Plus size={16} /> Create First Course</button>}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showActions
                    onEdit={(id) => navigate(`/courses/${id}/edit`)}
                    onDelete={(course) => setDeleteTarget(course)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Student: Enrolled Courses */
          <>
            {/* Continue Learning */}
            {enrollments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>
                  Continue Learning
                </h2>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '80px', height: '80px', flexShrink: 0,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={32} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                        {enrollments[0]?.course_title || enrollments[0]?.title || 'Your Course'}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                        {enrollments[0]?.instructor_name && `By ${enrollments[0].instructor_name}`}
                      </p>
                      <ProgressBar
                        percentage={progressMap[enrollments[0]?.course_id || enrollments[0]?.id] || 0}
                      />
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/courses/${enrollments[0]?.course_id || enrollments[0]?.id}`)}
                    >
                      <PlayCircle size={16} /> Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* All Enrolled Courses */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>My Courses</h2>
            </div>

            {enrollments.length === 0 ? (
              <EmptyState
                icon={<GraduationCap size={48} style={{ opacity: 0.3 }} />}
                title="No courses enrolled"
                description="Browse our course catalog and start learning today!"
                action={<button className="btn-primary" onClick={() => navigate('/')}><BookOpen size={16} /> Browse Courses</button>}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {enrollments.map(enrollment => {
                  const courseId = enrollment.course_id || enrollment.id
                  const pct = progressMap[courseId] || 0
                  return (
                    <CourseCard
                      key={courseId}
                      course={{
                        ...enrollment,
                        id: courseId,
                        title: enrollment.course_title || enrollment.title,
                      }}
                      isEnrolled
                      progressPercent={pct}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 20px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '12px', color: '#f1f5f9' }}>
              Delete Course?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#f1f5f9' }}>"{deleteTarget.title}"</strong>?
              This action cannot be undone and will remove all associated lessons and enrollments.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <><span className="spinner-sm" /> Deleting...</> : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '10px',
          background: `rgba(${color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : '99,102,241'},0.1)`,
          border: `1px solid rgba(${color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : '99,102,241'},0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '13px', color: '#64748b' }}>{label}</p>
    </div>
  )
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
    }}>
      <div style={{ color: '#334155', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>{description}</p>
      {action}
    </div>
  )
}

export default Dashboard
