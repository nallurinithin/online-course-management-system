import api from './api'

export const getCourses = (search) =>
  api.get('/api/courses', { params: search ? { search } : {} })

export const getCourse = (id) =>
  api.get(`/api/courses/${id}`)

export const createCourse = (data) =>
  api.post('/api/courses', data)

export const updateCourse = (id, data) =>
  api.put(`/api/courses/${id}`, data)

export const deleteCourse = (id) =>
  api.delete(`/api/courses/${id}`)

export const getLessons = (courseId) =>
  api.get(`/api/lessons/course/${courseId}`)

export const createLesson = (data) =>
  api.post('/api/lessons', data)

export const updateLesson = (id, data) =>
  api.put(`/api/lessons/${id}`, data)

export const deleteLesson = (id) =>
  api.delete(`/api/lessons/${id}`)

export const patchLessonVideo = (id, video_s3_key) =>
  api.patch(`/api/lessons/${id}/video`, { video_s3_key })

export const enroll = (courseId) =>
  api.post('/api/enrollments', { course_id: courseId })

export const getMyEnrollments = () =>
  api.get('/api/enrollments/my-courses')

export const getProgress = (courseId) =>
  api.get(`/api/progress/course/${courseId}`)

export const getProgressPercentage = (courseId) =>
  api.get(`/api/progress/course/${courseId}/percentage`)

export const completeLesson = (lessonId) =>
  api.post(`/api/progress/lesson/${lessonId}/complete`)

export const incompleteLesson = (lessonId) =>
  api.post(`/api/progress/lesson/${lessonId}/incomplete`)

export const unenroll = (courseId) =>
  api.delete(`/api/enrollments/${courseId}`)

export const completeEnrollment = (courseId) =>
  api.patch(`/api/enrollments/${courseId}/complete`)
