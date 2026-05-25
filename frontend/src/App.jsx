import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminRegister from './pages/AdminRegister'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CourseCreate from './pages/CourseCreate'
import CourseView from './pages/CourseView'
import CourseEdit from './pages/CourseEdit'
import QuizPage from './pages/QuizPage'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Protected routes (any authenticated user) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses/:id" element={<CourseView />} />

          {/* Instructor-only routes */}
          <Route element={<RoleRoute allowedRoles={['instructor']} />}>
            <Route path="/courses/create" element={<CourseCreate />} />
            <Route path="/courses/:id/edit" element={<CourseEdit />} />
          </Route>

          {/* Student-only routes */}
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/courses/:courseId/quiz/:quizId" element={<QuizPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
