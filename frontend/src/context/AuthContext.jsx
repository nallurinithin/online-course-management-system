import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const isSessionActive = sessionStorage.getItem('isSessionActive')
      if (isSessionActive === 'true') {
        try {
          const res = await api.get('/api/auth/me')
          setUser(res.data)
        } catch {
          setUser(null)
          sessionStorage.removeItem('isSessionActive')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Tab/browser was closed, clean up backend cookie
        try {
          await api.post('/api/auth/logout')
        } catch {
          // ignore
        } finally {
          setUser(null)
          setIsLoading(false)
        }
      }
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email, password, role, admin_secret = null) => {
    const res = await api.post('/api/auth/login', { email, password, role, admin_secret })
    setUser(res.data.user || res.data)
    sessionStorage.setItem('isSessionActive', 'true')
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore
    } finally {
      setUser(null)
      sessionStorage.removeItem('isSessionActive')
      navigate('/')
    }
  }, [navigate])

  const register = useCallback(async (data) => {
    const res = await api.post('/api/auth/register', data)
    setUser(res.data.user || res.data)
    sessionStorage.setItem('isSessionActive', 'true')
    return res.data
  }, [])

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
