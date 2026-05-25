import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, GraduationCap, ChevronRight, Zap, Users, Award, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginRole, setLoginRole] = useState('student')
  const [adminSecret, setAdminSecret] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (loginRole === 'admin' && !adminSecret) {
      toast.error('Admin secret key is required')
      return
    }
    setLoading(true)
    try {
      const data = await login(email, password, loginRole, adminSecret)
      toast.success('Welcome back!')
      if (data.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: '64px' }}>
      {/* Left Decorative Panel */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #0d1526 0%, #1e1b4b 50%, #0a1628 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left-panel">
        {/* Background orb */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
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
          Continue your<br />learning journey
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
          Access your courses, track your progress, and keep building skills that matter.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: <Users size={16} />, text: '10,000+ active learners' },
            { icon: <Award size={16} />, text: '500+ expert-led courses' },
            { icon: <Zap size={16} />, text: '94% completion rate' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3b82f6', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          marginTop: '48px',
          padding: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          borderLeft: '3px solid #6366f1',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
            "The beautiful thing about learning is nobody can take it away from you."
          </p>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>— B.B. King</p>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .login-left-panel { display: none !important; }
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
      }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
              Welcome back 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Role Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {[
                {
                  role: 'student',
                  icon: <GraduationCap size={20} />,
                  title: "Student",
                },
                {
                  role: 'instructor',
                  icon: <Users size={20} />,
                  title: "Instructor",
                },
                {
                  role: 'admin',
                  icon: <Shield size={20} />,
                  title: "Admin",
                },
              ].map(({ role, icon, title }) => {
                const selected = loginRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setLoginRole(role)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: `2px solid ${selected ? (role === 'admin' ? '#6366f1' : '#3b82f6') : 'rgba(255,255,255,0.1)'}`,
                      background: selected ? (role === 'admin' ? 'rgba(99,102,241,0.1)' : 'rgba(59,130,246,0.1)') : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <div style={{
                      color: selected ? (role === 'admin' ? '#6366f1' : '#3b82f6') : '#64748b',
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                      {icon}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: selected ? '#f1f5f9' : '#94a3b8', margin: 0 }}>
                      {title}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <span style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#64748b', padding: '4px',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Admin Secret Key */}
            {loginRole === 'admin' && (
              <div className="form-group">
                <label className="form-label">Admin Secret Key</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter admin secret key"
                  value={adminSecret}
                  onChange={e => setAdminSecret(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <><span className="spinner-sm" /> Signing in...</>
              ) : (
                <>Sign In <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '12px' }}>
              Are you an admin?{' '}
              <Link to="/admin/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                Admin portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
