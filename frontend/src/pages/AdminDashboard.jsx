import React, { useEffect, useState, useCallback } from 'react'
import { Shield, Users, BookOpen, UserCheck, Search, Trash2, ChevronDown } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({ total_users: 0, total_courses: 0, total_enrollments: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, coursesRes, statsRes] = await Promise.allSettled([
        api.get('/api/admin/users'),
        api.get('/api/courses'),
        api.get('/api/admin/stats').catch(() => ({ data: null })),
      ])

      const usersData = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : []
      const coursesData = coursesRes.status === 'fulfilled' ? (coursesRes.value.data || []) : []

      setUsers(usersData)
      setCourses(coursesData)

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data)
      } else {
        setStats({
          total_users: usersData.length,
          total_courses: coursesData.length,
          total_enrollments: coursesData.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
        })
      }
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/admin/users/${deleteTarget.id}`)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      toast.success('User deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleCounts = {
    all: users.length,
    student: users.filter(u => u.role === 'student').length,
    instructor: users.filter(u => u.role === 'instructor').length,
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
      instructor: { background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' },
      student: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    }
    return styles[role] || styles.student
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div className="page-container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="#6366f1" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9' }}>Admin Dashboard</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginLeft: '54px' }}>
            Manage users, courses, and platform settings
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total Users', value: stats.total_users, icon: <Users size={20} />, color: '#3b82f6' },
            { label: 'Total Courses', value: stats.total_courses, icon: <BookOpen size={20} />, color: '#6366f1' },
            { label: 'Total Enrollments', value: stats.total_enrollments, icon: <UserCheck size={20} />, color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ padding: '20px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', marginBottom: '12px',
                background: `rgba(${stat.color === '#3b82f6' ? '59,130,246' : stat.color === '#6366f1' ? '99,102,241' : '16,185,129'},0.1)`,
                border: `1px solid rgba(${stat.color === '#3b82f6' ? '59,130,246' : stat.color === '#6366f1' ? '99,102,241' : '16,185,129'},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '4px' }}>
                {loading ? '—' : stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Users</h2>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '320px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', padding: '10px 14px 10px 36px' }}
              />
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div style={{
            display: 'flex', gap: '0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 24px',
            overflowX: 'auto',
          }}>
            {['all', 'student', 'instructor'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '12px 20px',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${roleFilter === role ? '#3b82f6' : 'transparent'}`,
                  color: roleFilter === role ? '#3b82f6' : '#64748b',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
                <span style={{
                  padding: '1px 7px', borderRadius: '999px', fontSize: '11px',
                  background: roleFilter === role ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                  color: roleFilter === role ? '#3b82f6' : '#64748b',
                }}>
                  {roleCounts[role] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>No users found</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, color: 'white',
                          }}>
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '14px' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{u.email}</td>
                      <td>
                        <span style={{
                          ...getRoleBadge(u.role),
                          padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{formatDate(u.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            cursor: 'pointer', color: '#ef4444',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontSize: '12px', fontFamily: 'Inter',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '13px', color: '#64748b',
            }}>
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 20px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '12px', color: '#f1f5f9' }}>
              Delete User?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#f1f5f9' }}>{deleteTarget.name}</strong>?
              This will remove their account and all associated data.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className="spinner-sm" /> Deleting...</> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
