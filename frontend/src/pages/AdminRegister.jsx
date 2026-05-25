import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, ChevronRight } from 'lucide-react'
import { adminRegister } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', admin_secret: '' })
  const [showPw, setShowPw] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.admin_secret) {
      toast.error('All fields are required')
      return
    }
    setLoading(true)
    try {
      const res = await adminRegister(form)
      setUser(res.data.user || res.data)
      sessionStorage.setItem('isSessionActive', 'true')
      toast.success('Admin account created')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Admin registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={30} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Admin Registration
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        {/* Warning Banner */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '10px',
          marginBottom: '28px',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <Shield size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ color: '#f59e0b', fontSize: '12px', lineHeight: 1.5 }}>
            This page is for administrator account creation only. A valid admin secret key is required.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="input-field" placeholder="Admin Name"
                value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input-field" placeholder="admin@example.com"
                value={form.email} onChange={e => handleChange('email', e.target.value)} autoComplete='off' />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input-field"
                  placeholder="••••••••" value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  style={{ paddingRight: '48px' }} autoComplete='new-password'/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Secret Key</label>
              <div style={{ position: 'relative' }}>
                <input type={showSecret ? 'text' : 'password'} className="input-field"
                  placeholder="Enter admin secret key"
                  value={form.admin_secret} onChange={e => handleChange('admin_secret', e.target.value)}
                  style={{ paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowSecret(!showSecret)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="form-hint">Contact your system administrator for the secret key</p>
            </div>

            <button type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px' }}
              disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Creating...</> : <><Shield size={15} /> Create Admin Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister
