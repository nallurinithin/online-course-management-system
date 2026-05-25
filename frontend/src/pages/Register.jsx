import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, GraduationCap, Briefcase, ChevronRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: '#ef4444' },
    { score: 2, label: 'Fair', color: '#f59e0b' },
    { score: 3, label: 'Good', color: '#3b82f6' },
    { score: 4, label: 'Strong', color: '#10b981' },
  ]
  return levels[score] || levels[0]
}

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const strength = getPasswordStrength(form.password)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: '64px' }}>
      {/* Left Decorative Panel */}
      <div style={{
        flex: '0 0 42%',
        background: 'linear-gradient(135deg, #0d1526 0%, #1e1b4b 50%, #0a1628 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="register-left-panel">
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <span style={{
            fontSize: '22px', fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            LearnHub
          </span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px', lineHeight: 1.2 }}>
          Join the learning<br />revolution
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
          Whether you're here to learn or teach, LearnHub gives you everything you need to succeed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            'Access 500+ expert-led courses',
            'Track your learning progress',
            'Earn skill badges and certificates',
            'Learn at your own pace',
            'Interactive quizzes and exercises',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>{item}</span>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .register-left-panel { display: none !important; }
          }
        `}</style>
      </div>

      {/* Right Form Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.5s ease', padding: '20px 0' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
              Create your account
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              {
                role: 'student',
                icon: <GraduationCap size={24} />,
                title: "I'm a Student",
                desc: 'Learn new skills',
              },
              {
                role: 'instructor',
                icon: <Briefcase size={24} />,
                title: "I'm an Instructor",
                desc: 'Teach and earn',
              },
            ].map(({ role, icon, title, desc }) => {
              const selected = form.role === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleChange('role', role)}
                  style={{
                    padding: '18px 14px',
                    borderRadius: '12px',
                    border: `2px solid ${selected ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                    background: selected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div style={{
                    color: selected ? '#3b82f6' : '#64748b',
                    marginBottom: '8px',
                  }}>
                    {icon}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: selected ? '#f1f5f9' : '#94a3b8', marginBottom: '2px' }}>
                    {title}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{desc}</p>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} style={{
                        flex: 1, height: '3px', borderRadius: '999px',
                        background: s <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  {strength.label && (
                    <p style={{ fontSize: '11px', color: strength.color, fontWeight: 500 }}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  style={{
                    paddingRight: '48px',
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? '#ef4444' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px' }}
            >
              {loading ? (
                <><span className="spinner-sm" /> Creating account...</>
              ) : (
                <>Create Account <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '20px' }}>
            By registering, you agree to our{' '}
            <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
