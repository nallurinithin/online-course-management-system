import api from './api'

export const getQuiz = (lessonId) =>
  api.get(`/api/quizzes/lesson/${lessonId}`)

export const createQuiz = (data) =>
  api.post('/api/quizzes', data)

export const updateQuiz = (id, data) =>
  api.put(`/api/quizzes/${id}`, data)

export const submitAttempt = (quizId, answers) =>
  api.post(`/api/quizzes/${quizId}/attempt`, { quiz_id: quizId, answers })

export const getMyResult = (quizId) =>
  api.get(`/api/quizzes/${quizId}/my-result`)

export const getAllResults = (quizId) =>
  api.get(`/api/quizzes/${quizId}/all-results`)
