import api from './api'

export const login = (email, password, role, admin_secret = null) =>
  api.post('/api/auth/login', { email, password, role, admin_secret })

export const register = (data) =>
  api.post('/api/auth/register', data)

export const logout = () =>
  api.post('/api/auth/logout')

export const getMe = () =>
  api.get('/api/auth/me')

export const adminRegister = (data) =>
  api.post('/api/admin/register', data, {
    headers: { 'X-Admin-Secret': data.admin_secret },
  })
