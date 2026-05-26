import React, { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, LogOut, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    await logout()
  }

  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
      instructor: { background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' },
      student: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    }
    return styles[role] || styles.student
  }

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to={user?.role === 'admin' ? "/admin/dashboard" : (isAuthenticated ? "/dashboard" : "/")} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={18} color="white" />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              LearnHub
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
            {!isAuthenticated && (
              <NavLink to="/courses" label="Courses" active={location.pathname.startsWith('/courses') && !location.pathname.includes('/create') && !location.pathname.includes('/edit')} />
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <NavLink to="/dashboard" label="Dashboard" active={isActive('/dashboard') && !location.search.includes('tab=browse')} />
            )}
            {isAuthenticated && user?.role === 'student' && (
              <NavLink to="/dashboard?tab=browse" label="Browse Courses" active={location.search.includes('tab=browse')} />
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" label="Admin Panel" active={isActive('/admin/dashboard')} icon={<ShieldCheck size={14} />} />
            )}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <button className="btn-ghost" style={{ padding: '8px 18px' }}>Login</button>
                </Link>
                <Link to="/register">
                  <button className="btn-primary" style={{ padding: '8px 18px' }}>Register</button>
                </Link>
              </>
            ) : (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    color: '#f1f5f9',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '30px', height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: 'white',
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'User'}
                  </span>
                  <span style={{ ...getRoleBadgeStyle(user?.role), padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>
                    {user?.role}
                  </span>
                  <ChevronDown size={14} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#0d1526',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '180px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 100,
                  }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'transparent', border: 'none',
                        color: '#ef4444', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        fontSize: '14px', fontWeight: 500,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#f1f5f9',
              }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(10,15,30,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 999,
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {!isAuthenticated && (
            <>
              <MobileNavLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
              <MobileNavLink to="/courses" label="Courses" onClick={() => setMobileOpen(false)} />
            </>
          )}
          {isAuthenticated && user?.role !== 'admin' && (
            <MobileNavLink to="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
          )}
          {isAuthenticated && user?.role === 'student' && (
            <MobileNavLink to="/dashboard?tab=browse" label="Browse Courses" onClick={() => setMobileOpen(false)} />
          )}
          {user?.role === 'admin' && (
            <MobileNavLink to="/admin/dashboard" label="Admin Panel" onClick={() => setMobileOpen(false)} />
          )}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          {!isAuthenticated ? (
            <>
              <MobileNavLink to="/login" label="Login" onClick={() => setMobileOpen(false)} />
              <MobileNavLink to="/register" label="Register" onClick={() => setMobileOpen(false)} />
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                fontSize: '14px', fontWeight: 500, width: '100%',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  )
}

function NavLink({ to, label, active, icon }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '8px',
        background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
        border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
        color: active ? '#3b82f6' : '#94a3b8',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        fontSize: '14px', fontWeight: 500,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}}
      >
        {icon}
        {label}
      </button>
    </Link>
  )
}

function MobileNavLink({ to, label, onClick }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }} onClick={onClick}>
      <div style={{
        padding: '12px 16px', borderRadius: '10px',
        color: '#94a3b8', fontSize: '15px', fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f1f5f9' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
      >
        {label}
      </div>
    </Link>
  )
}

export default Navbar
