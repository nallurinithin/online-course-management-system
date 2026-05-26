import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Award, TrendingUp, Star, ChevronRight, Play, BarChart2, Zap } from 'lucide-react'
import { getCourses } from '../services/courseService'
import CourseCard from '../components/CourseCard'
import { useAuth } from '../context/AuthContext'

function Home() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const coursesRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses()
        setCourses((res.data || []).slice(0, 6))
      } catch {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const stats = [
    { label: 'Courses', value: '500+', icon: <BookOpen size={20} /> },
    { label: 'Students', value: '10K+', icon: <Users size={20} /> },
    { label: 'Instructors', value: '200+', icon: <Award size={20} /> },
    { label: 'Completion Rate', value: '94%', icon: <TrendingUp size={20} /> },
  ]

  const features = [
    {
      icon: <Award size={28} color="#3b82f6" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience in their fields.',
      color: '#3b82f6',
    },
    {
      icon: <BarChart2 size={28} color="#10b981" />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress tracking and completion certificates.',
      color: '#10b981',
    },
    {
      icon: <Zap size={28} color="#6366f1" />,
      title: 'Quiz Yourself',
      description: 'Reinforce your knowledge with interactive quizzes at the end of each lesson.',
      color: '#6366f1',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Full Stack Developer',
      initials: 'SM',
      color: '#3b82f6',
      text: 'LearnHub transformed my career. The quality of courses and instructors is unmatched. I went from zero to landing my dream job in 6 months.',
      rating: 5,
    },
    {
      name: 'James Okafor',
      role: 'Data Scientist',
      initials: 'JO',
      color: '#6366f1',
      text: 'The progress tracking feature kept me motivated throughout my data science journey. Highly recommend for anyone serious about learning.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'UX Designer',
      initials: 'PS',
      color: '#10b981',
      text: 'As an instructor, LearnHub gave me the tools to reach thousands of students. The platform is incredibly intuitive and powerful.',
      rating: 5,
    },
  ]

  return (
    <div style={{ paddingTop: '64px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 50%, #0a0f1e 100%)',
      }}>
        {/* Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '15%', left: '10%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%', right: '5%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', right: '30%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          animation: 'float 5s ease-in-out infinite 2s',
          pointerEvents: 'none',
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{
            maxWidth: '700px',
            animation: 'fadeIn 0.8s ease forwards',
          }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '999px',
              padding: '6px 16px',
              marginBottom: '28px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>
                The Future of Online Learning
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              color: '#f1f5f9',
            }}>
              Learn Without{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Limits
              </span>
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '40px',
              maxWidth: '540px',
            }}>
              Join thousands of learners mastering new skills. Create, share, and consume world-class courses — all in one place.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <button className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', gap: '10px' }}>
                  Get Started Free <ChevronRight size={18} />
                </button>
              </Link>
              <button
                className="btn-secondary"
                style={{ fontSize: '16px', padding: '14px 32px', gap: '10px' }}
                onClick={scrollToCourses}
              >
                <Play size={16} /> Browse Courses
              </button>
            </div>

            {/* Mini Stats */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
              {[
                { value: '500+', label: 'Courses' },
                { value: '10K+', label: 'Students' },
                { value: '4.9★', label: 'Rating' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 0',
      }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#3b82f6',
                  flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section ref={coursesRef} style={{ padding: '80px 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#6366f1',
              padding: '4px 16px', borderRadius: '999px',
              fontSize: '12px', fontWeight: 600,
              marginBottom: '16px',
            }}>
              FEATURED COURSES
            </span>
            <h2 className="section-title">
              Start Learning{' '}
              <span className="gradient-text">Today</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>
              Handpicked courses from expert instructors
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: '340px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px' }}>No courses available yet. Be the first to create one!</p>
            </div>
          )}

          {courses.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link to="/dashboard">
                <button className="btn-secondary" style={{ fontSize: '15px', padding: '12px 32px' }}>
                  View All Courses <ChevronRight size={16} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '80px 0',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">
              Why Choose{' '}
              <span className="gradient-text">LearnHub?</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>
              Everything you need to learn and grow
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map((feat, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: '32px', transition: 'all 0.3s ease' }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 20px 60px rgba(${feat.color === '#3b82f6' ? '59,130,246' : feat.color === '#10b981' ? '16,185,129' : '99,102,241'},0.1)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '16px',
                  background: `rgba(${feat.color === '#3b82f6' ? '59,130,246' : feat.color === '#10b981' ? '16,185,129' : '99,102,241'},0.1)`,
                  border: `1px solid rgba(${feat.color === '#3b82f6' ? '59,130,246' : feat.color === '#10b981' ? '16,185,129' : '99,102,241'},0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
                  {feat.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7 }}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">
              Loved by{' '}
              <span className="gradient-text">Learners</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>
              Don't just take our word for it
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px' }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                  "{t.text}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: 'white',
                    flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{t.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: '#f1f5f9' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
            Join thousands of students and instructors building the future together.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                Create Free Account
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px' }} className="gradient-text">LearnHub</span>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              {['Courses', 'About', 'Privacy', 'Terms'].map(link => (
                <span key={link} style={{ color: '#64748b', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {link}
                </span>
              ))}
            </div>

            <p style={{ color: '#475569', fontSize: '13px' }}>
              © {new Date().getFullYear()} LearnHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
