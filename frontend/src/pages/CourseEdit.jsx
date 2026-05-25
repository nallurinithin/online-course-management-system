import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, Film } from 'lucide-react'
import {
  getCourse, getLessons, updateCourse,
  createLesson, updateLesson, deleteLesson, patchLessonVideo
} from '../services/courseService'
import { getQuiz, createQuiz, updateQuiz } from '../services/quizService'
import VideoUploader from '../components/VideoUploader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

function CourseEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseForm, setCourseForm] = useState({ title: '', description: '' })
  const [addingLesson, setAddingLesson] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [quizModal, setQuizModal] = useState(null) // { lessonId, quiz: null | quiz }
  const [quizForm, setQuizForm] = useState({ title: '', questions: [] })
  const [newQ, setNewQ] = useState({ question_text: '', options: ['', '', '', ''], correct_answer: '' })
  const [deletingLesson, setDeletingLesson] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [courseRes, lessonsRes] = await Promise.all([getCourse(id), getLessons(id)])
      setCourse(courseRes.data)
      setCourseForm({ title: courseRes.data.title, description: courseRes.data.description || '' })

      const lessonsArr = lessonsRes.data || []
      // Fetch quizzes for each lesson
      const withQuiz = await Promise.all(
        lessonsArr.map(async (l) => {
          try {
            const qRes = await getQuiz(l.id)
            return { ...l, quiz: qRes.data || null }
          } catch {
            return { ...l, quiz: null }
          }
        })
      )
      setLessons(withQuiz)
    } catch {
      toast.error('Failed to load course')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      await updateCourse(id, courseForm)
      toast.success('Course updated!')
    } catch {
      toast.error('Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) { toast.error('Lesson title required'); return }
    try {
      const res = await createLesson({
        course_id: id,
        title: newLessonTitle,
        order_index: lessons.length + 1,
      })
      setLessons(prev => [...prev, { ...res.data, quiz: null }])
      setNewLessonTitle('')
      setAddingLesson(false)
      toast.success('Lesson added')
    } catch {
      toast.error('Failed to add lesson')
    }
  }

  const handleSaveLesson = async (lessonId) => {
    try {
      await updateLesson(lessonId, { title: editingTitle })
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, title: editingTitle } : l))
      setEditingLessonId(null)
      toast.success('Lesson updated')
    } catch {
      toast.error('Failed to update lesson')
    }
  }

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return
    try {
      await deleteLesson(deletingLesson)
      setLessons(prev => prev.filter(l => l.id !== deletingLesson).map((l, i) => ({ ...l, order_index: i + 1 })))
      setDeletingLesson(null)
      toast.success('Lesson deleted')
    } catch {
      toast.error('Failed to delete lesson')
    }
  }

  const handleVideoUpload = async (lessonId, s3Key) => {
    try {
      await patchLessonVideo(lessonId, s3Key)
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, video_s3_key: s3Key } : l))
      toast.success('Video updated!')
    } catch {
      toast.error('Failed to update video')
    }
  }

  const moveLesson = async (idx, dir) => {
    const newLessons = [...lessons]
    const swap = idx + dir
    if (swap < 0 || swap >= newLessons.length) return
    ;[newLessons[idx], newLessons[swap]] = [newLessons[swap], newLessons[idx]]
    setLessons(newLessons.map((l, i) => ({ ...l, order_index: i + 1 })))
  }

  const openQuizModal = (lesson) => {
    setQuizModal({ lessonId: lesson.id, quiz: lesson.quiz })
    setQuizForm(lesson.quiz ? { title: lesson.quiz.title, questions: lesson.quiz.questions || [] } : { title: '', questions: [] })
    setNewQ({ question_text: '', options: ['', '', '', ''], correct_answer: '' })
  }

  const addQuestion = () => {
    if (!newQ.question_text.trim()) { toast.error('Question text required'); return }
    if (newQ.options.some(o => !o.trim())) { toast.error('All options required'); return }
    if (!newQ.correct_answer.trim()) { toast.error('Select correct answer'); return }
    setQuizForm(p => ({ ...p, questions: [...p.questions, { ...newQ }] }))
    setNewQ({ question_text: '', options: ['', '', '', ''], correct_answer: '' })
  }

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) { toast.error('Quiz title required'); return }
    if (quizForm.questions.length === 0) { toast.error('Add at least one question'); return }
    try {
      if (quizModal.quiz) {
        await updateQuiz(quizModal.quiz.id, quizForm)
      } else {
        await createQuiz({ lesson_id: quizModal.lessonId, ...quizForm })
      }
      setLessons(prev => prev.map(l => l.id === quizModal.lessonId ? { ...l, quiz: { ...quizForm } } : l))
      setQuizModal(null)
      toast.success('Quiz saved!')
    } catch {
      toast.error('Failed to save quiz')
    }
  }

  if (loading) return <Loader />

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div className="page-container" style={{ padding: '40px 24px', maxWidth: '860px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={16} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>Edit Course</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Make changes to your course and lessons</p>
          </div>
        </div>

        {/* Course Details */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Course Details</h2>

          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input type="text" className="input-field" value={courseForm.title}
              onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input-field" value={courseForm.description}
              onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
              style={{ minHeight: '100px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleSaveCourse} disabled={saving}>
              {saving ? <><span className="spinner-sm" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Lessons */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
              Lessons ({lessons.length})
            </h2>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setAddingLesson(true)}>
              <Plus size={14} /> Add Lesson
            </button>
          </div>

          {/* Add Lesson */}
          {addingLesson && (
            <div style={{
              padding: '16px', background: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', marginBottom: '16px',
            }}>
              <input type="text" className="input-field" placeholder="Lesson title"
                value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)}
                style={{ marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => { setAddingLesson(false); setNewLessonTitle('') }}>Cancel</button>
                <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={handleAddLesson}><Plus size={13} /> Add</button>
              </div>
            </div>
          )}

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
              No lessons yet. Add your first lesson above.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, minWidth: '20px', paddingTop: '2px' }}>
                      {idx + 1}
                    </span>

                    <div style={{ flex: 1 }}>
                      {editingLessonId === lesson.id ? (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <input type="text" className="input-field" value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px' }} />
                          <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                            onClick={() => handleSaveLesson(lesson.id)}>Save</button>
                          <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }}
                            onClick={() => setEditingLessonId(null)}>✕</button>
                        </div>
                      ) : (
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '10px' }}>
                          {lesson.title}
                        </p>
                      )}

                      {/* Video Upload */}
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                          {lesson.video_s3_key ? '✓ Video uploaded — Replace:' : 'Upload Video:'}
                        </p>
                        <VideoUploader
                          acceptTypes="video/*"
                          label="Upload/Replace Video"
                          hint="MP4, MOV — Max 500MB"
                          courseId={id}
                          lessonId={lesson.id}
                          onUploadComplete={(key) => handleVideoUpload(lesson.id, key)}
                        />
                      </div>

                      {/* Quiz indicator */}
                      {lesson.quiz && (
                        <div style={{ fontSize: '12px', color: '#6366f1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🧠 Quiz attached ({lesson.quiz.questions?.length || 0} questions)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => moveLesson(idx, -1)} disabled={idx === 0}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: '#64748b', padding: '4px' }}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1}
                        style={{ background: 'none', border: 'none', cursor: idx === lessons.length - 1 ? 'default' : 'pointer', color: '#64748b', padding: '4px' }}>
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => { setEditingLessonId(lesson.id); setEditingTitle(lesson.title) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px', fontSize: '11px', fontFamily: 'Inter' }}>
                        ✎ Edit
                      </button>
                      <button onClick={() => openQuizModal(lesson)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '4px', fontSize: '11px', fontFamily: 'Inter' }}>
                        {lesson.quiz ? '✎ Quiz' : '+ Quiz'}
                      </button>
                      <button onClick={() => setDeletingLesson(lesson.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Lesson Modal */}
      {deletingLesson && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>Delete Lesson?</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              This will permanently delete this lesson and its associated video/quiz.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDeletingLesson(null)}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleDeleteLesson}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModal && (
        <div className="modal-overlay">
          <div style={{
            background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '600px',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
              {quizModal.quiz ? 'Edit Quiz' : 'Add Quiz'}
            </h3>

            <div className="form-group">
              <label className="form-label">Quiz Title</label>
              <input type="text" className="input-field" value={quizForm.title}
                onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            {quizForm.questions.map((q, qi) => (
              <div key={qi} style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', marginBottom: '6px' }}>Q{qi + 1}: {q.question_text}</p>
                {q.options.map((o, oi) => (
                  <p key={oi} style={{ fontSize: '12px', color: o === q.correct_answer ? '#10b981' : '#64748b', marginLeft: '10px' }}>
                    {String.fromCharCode(65 + oi)}. {o} {o === q.correct_answer ? '✓' : ''}
                  </p>
                ))}
                <button onClick={() => setQuizForm(p => ({ ...p, questions: p.questions.filter((_, i) => i !== qi) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>
                  Remove
                </button>
              </div>
            ))}

            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px' }}>Add Question</p>
              <div className="form-group">
                <input type="text" className="input-field" placeholder="Question text"
                  value={newQ.question_text} onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {newQ.options.map((opt, oi) => (
                  <input key={oi} type="text" className="input-field" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    value={opt} onChange={e => { const opts = [...newQ.options]; opts[oi] = e.target.value; setNewQ(p => ({ ...p, options: opts })) }} />
                ))}
              </div>
              <div className="form-group">
                <select className="input-field" value={newQ.correct_answer}
                  onChange={e => setNewQ(p => ({ ...p, correct_answer: e.target.value }))}>
                  <option value="">Select correct answer</option>
                  {newQ.options.filter(o => o.trim()).map((o, i) => (
                    <option key={i} value={o}>{String.fromCharCode(65 + i)}. {o}</option>
                  ))}
                </select>
              </div>
              <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }} onClick={addQuestion}>
                <Plus size={13} /> Add Question
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setQuizModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSaveQuiz}>Save Quiz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseEdit
