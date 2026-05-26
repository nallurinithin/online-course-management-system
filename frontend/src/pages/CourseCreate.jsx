import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown, Check, Film } from 'lucide-react'
import { createCourse, createLesson, patchLessonVideo } from '../services/courseService'
import { createQuiz } from '../services/quizService'
import VideoUploader from '../components/VideoUploader'
import { useAuth } from '../context/AuthContext'
import { getViewUrl } from '../services/uploadService'
import toast from 'react-hot-toast'

function CourseCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [createdCourseId, setCreatedCourseId] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState(null)

  // Step 1 state
  const [courseData, setCourseData] = useState({ title: '', description: '', thumbnail_s3_key: '' })

  // Step 2 state
  const [lessons, setLessons] = useState([])
  const [newLesson, setNewLesson] = useState({ title: '', video_s3_key: '', quiz: null })
  const [addingLesson, setAddingLesson] = useState(false)
  const [addQuizToLesson, setAddQuizToLesson] = useState(null) // lesson index
  const [quizData, setQuizData] = useState({ title: '', questions: [] })
  const [newQuestion, setNewQuestion] = useState({ question_text: '', options: ['', '', '', ''], correct_answer: '' })

  // Step 3
  const [publishing, setPublishing] = useState(false)

  const steps = [
    { num: 1, label: 'Course Details' },
    { num: 2, label: 'Add Lessons' },
    { num: 3, label: 'Review & Publish' },
  ]

  // --- Step 1 Handlers ---
  const handleStep1Next = () => {
    if (!courseData.title.trim()) { toast.error('Course title is required'); return }
    if (!courseData.description.trim()) { toast.error('Description is required'); return }
    setStep(2)
  }

  // --- Step 2 Handlers ---
  const addLesson = () => {
    if (!newLesson.title.trim()) { toast.error('Lesson title is required'); return }
    setLessons(prev => [...prev, { ...newLesson, order_index: prev.length + 1 }])
    setNewLesson({ title: '', video_s3_key: '', quiz: null })
    setAddingLesson(false)
    toast.success('Lesson added')
  }

  const handleStep2Next = () => {
    if (addingLesson) {
      if (newLesson.title.trim()) {
        setLessons(prev => [...prev, { ...newLesson, order_index: prev.length + 1 }])
        setNewLesson({ title: '', video_s3_key: '', quiz: null })
        setAddingLesson(false)
        toast.success('Lesson auto-saved and added!')
        setStep(3)
      } else if (newLesson.video_s3_key) {
        toast.error('Please enter a lesson title for the uploaded video')
      } else {
        setAddingLesson(false)
        setStep(3)
      }
    } else {
      setStep(3)
    }
  }

  const removeLesson = (idx) => {
    setLessons(prev => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order_index: i + 1 })))
  }

  const moveLesson = (idx, dir) => {
    const newLessons = [...lessons]
    const swap = idx + dir
    if (swap < 0 || swap >= newLessons.length) return
    ;[newLessons[idx], newLessons[swap]] = [newLessons[swap], newLessons[idx]]
    setLessons(newLessons.map((l, i) => ({ ...l, order_index: i + 1 })))
  }

  const saveQuizToLesson = (idx) => {
    if (!quizData.title.trim()) { toast.error('Quiz title required'); return }
    if (quizData.questions.length === 0) { toast.error('Add at least one question'); return }
    const updated = [...lessons]
    updated[idx] = { ...updated[idx], quiz: { ...quizData } }
    setLessons(updated)
    setAddQuizToLesson(null)
    setQuizData({ title: '', questions: [] })
    toast.success('Quiz attached to lesson')
  }

  const addQuestion = () => {
    if (!newQuestion.question_text.trim()) { toast.error('Question text required'); return }
    if (newQuestion.options.some(o => !o.trim())) { toast.error('All 4 options required'); return }
    if (!newQuestion.correct_answer.trim()) { toast.error('Select correct answer'); return }
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion }],
    }))
    setNewQuestion({ question_text: '', options: ['', '', '', ''], correct_answer: '' })
    toast.success('Question added')
  }

  // --- Publish ---
  const handlePublish = async () => {
    setPublishing(true)
    try {
      // Create course
      const courseRes = await createCourse({
        title: courseData.title,
        description: courseData.description,
        thumbnail_s3_key: courseData.thumbnail_s3_key || undefined,
      })
      const course = courseRes.data
      const courseId = course.id

      // Create lessons
      for (const lesson of lessons) {
        const lessonRes = await createLesson({
          course_id: courseId,
          title: lesson.title,
          order_index: lesson.order_index,
        })
        const lessonId = lessonRes.data.id

        if (lesson.video_s3_key) {
          await patchLessonVideo(lessonId, lesson.video_s3_key)
        }

        if (lesson.quiz) {
          await createQuiz({
            lesson_id: lessonId,
            title: lesson.quiz.title,
            questions: lesson.quiz.questions,
          })
        }
      }

      toast.success('Course published successfully! 🎉')
      navigate(`/courses/${courseId}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish course')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div className="page-container" style={{ padding: '40px 24px', maxWidth: '800px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
            Create New Course
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Build and publish your course in 3 easy steps</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '0' }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: step > s.num ? '#10b981' : step === s.num ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${step >= s.num ? (step > s.num ? '#10b981' : '#3b82f6') : 'rgba(255,255,255,0.12)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: 'white',
                  flexShrink: 0,
                }}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: step === s.num ? '#f1f5f9' : '#475569',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 12px',
                  background: step > s.num ? '#10b981' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Course Details */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '24px' }}>Course Details</h2>

            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Complete Web Development Bootcamp"
                value={courseData.title}
                onChange={e => setCourseData(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="input-field"
                placeholder="What will students learn? What topics will be covered?"
                value={courseData.description}
                onChange={e => setCourseData(p => ({ ...p, description: e.target.value }))}
                style={{ minHeight: '120px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Thumbnail (Optional)</label>
              <VideoUploader
                acceptTypes="image/*"
                label="Upload Thumbnail Image"
                hint="PNG, JPG, WEBP — Recommended 1280×720"
                onUploadComplete={async (key) => {
                  setCourseData(p => ({ ...p, thumbnail_s3_key: key }))
                  try {
                    const res = await getViewUrl(key)
                    setThumbnailUrl(res.data?.view_url || res.data?.url || null)
                  } catch {
                    setThumbnailUrl(null)
                  }
                }}
              />
              {courseData.thumbnail_s3_key && (
                <p style={{ color: '#10b981', fontSize: '12px', marginTop: '6px' }}>✓ Thumbnail uploaded</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn-primary" onClick={handleStep1Next}>
                Next: Add Lessons <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Lessons */}
        {step === 2 && (
          <div>
            {/* Lessons List */}
            {lessons.length > 0 && (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>
                  Added Lessons ({lessons.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lessons.map((lesson, idx) => (
                    <div key={idx} style={{
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, minWidth: '20px' }}>
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lesson.title}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                          {lesson.video_s3_key && (
                            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Film size={10} /> Video uploaded
                            </span>
                          )}
                          {lesson.quiz && (
                            <span style={{ fontSize: '11px', color: '#6366f1' }}>
                              Quiz: {lesson.quiz.questions.length}Q
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => moveLesson(idx, -1)} disabled={idx === 0}
                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#334155' : '#64748b', padding: '4px' }}>
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1}
                          style={{ background: 'none', border: 'none', cursor: idx === lessons.length - 1 ? 'default' : 'pointer', color: idx === lessons.length - 1 ? '#334155' : '#64748b', padding: '4px' }}>
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => { setAddQuizToLesson(idx); setQuizData({ title: '', questions: [] }) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: lesson.quiz ? '#6366f1' : '#64748b', padding: '4px', fontSize: '11px', fontFamily: 'Inter' }}>
                          {lesson.quiz ? '✓Quiz' : '+Quiz'}
                        </button>
                        <button onClick={() => removeLesson(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Lesson Form */}
            {addingLesson ? (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
                  New Lesson
                </h2>
                <div className="form-group">
                  <label className="form-label">Lesson Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Introduction to React Hooks"
                    value={newLesson.title}
                    onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lesson Video (Optional)</label>
                  <VideoUploader
                    acceptTypes="video/*"
                    label="Upload Lesson Video"
                    hint="MP4, MOV — Max 500MB"
                    onUploadComplete={(key) => setNewLesson(p => ({ ...p, video_s3_key: key }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn-ghost" onClick={() => { setAddingLesson(false); setNewLesson({ title: '', video_s3_key: '', quiz: null }) }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={addLesson}>
                    <Plus size={15} /> Add Lesson
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: '20px', borderStyle: 'dashed' }}
                onClick={() => setAddingLesson(true)}
              >
                <Plus size={16} /> Add Lesson
              </button>
            )}

            {/* Quiz Modal */}
            {addQuizToLesson !== null && (
              <div className="modal-overlay">
                <div style={{
                  background: '#0d1526',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '28px',
                  width: '100%', maxWidth: '600px',
                  maxHeight: '80vh', overflowY: 'auto',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
                    Quiz for: {lessons[addQuizToLesson]?.title}
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Quiz Title</label>
                    <input type="text" className="input-field" placeholder="e.g. Lesson Knowledge Check"
                      value={quizData.title} onChange={e => setQuizData(p => ({ ...p, title: e.target.value }))} />
                  </div>

                  {quizData.questions.map((q, qi) => (
                    <div key={qi} style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', marginBottom: '6px' }}>Q{qi + 1}: {q.question_text}</p>
                      {q.options.map((o, oi) => (
                        <p key={oi} style={{ fontSize: '12px', color: o === q.correct_answer ? '#10b981' : '#64748b', marginLeft: '10px' }}>
                          {String.fromCharCode(65 + oi)}. {o} {o === q.correct_answer ? '✓' : ''}
                        </p>
                      ))}
                    </div>
                  ))}

                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px' }}>Add Question</p>
                    <div className="form-group">
                      <input type="text" className="input-field" placeholder="Question text"
                        value={newQuestion.question_text}
                        onChange={e => setNewQuestion(p => ({ ...p, question_text: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      {newQuestion.options.map((opt, oi) => (
                        <input key={oi} type="text" className="input-field"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={e => {
                            const opts = [...newQuestion.options]; opts[oi] = e.target.value
                            setNewQuestion(p => ({ ...p, options: opts }))
                          }} />
                      ))}
                    </div>
                    <div className="form-group">
                      <select className="input-field" value={newQuestion.correct_answer}
                        onChange={e => setNewQuestion(p => ({ ...p, correct_answer: e.target.value }))}>
                        <option value="">Select correct answer</option>
                        {newQuestion.options.filter(o => o.trim()).map((o, i) => (
                          <option key={i} value={o}>{String.fromCharCode(65 + i)}. {o}</option>
                        ))}
                      </select>
                    </div>
                    <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={addQuestion}>
                      <Plus size={13} /> Add Question
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAddQuizToLesson(null)}>
                      Cancel
                    </button>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => saveQuizToLesson(addQuizToLesson)}>
                      Save Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button className="btn-ghost" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Back
              </button>
              <button className="btn-primary" onClick={handleStep2Next}>
                Review <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
                Course Preview
              </h2>

              {/* Preview Card */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '160px', height: '100px', flexShrink: 0,
                  borderRadius: '10px',
                  background: thumbnailUrl
                    ? `url("${thumbnailUrl}") center/cover`
                    : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!thumbnailUrl && <BookOpen size={32} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                    {courseData.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
                    {courseData.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      By {user?.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons Summary */}
              {lessons.length > 0 && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lessons
                  </p>
                  {lessons.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700 }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: '14px', color: '#cbd5e1' }}>{l.title}</span>
                      {l.video_s3_key && <span style={{ fontSize: '11px', color: '#10b981' }}>📹 Video</span>}
                      {l.quiz && <span style={{ fontSize: '11px', color: '#6366f1' }}>🧠 Quiz</span>}
                    </div>
                  ))}
                </>
              )}
            </div>

            {lessons.length === 0 && (
              <div style={{
                padding: '16px 20px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                marginBottom: '20px', fontSize: '13px', color: '#f59e0b',
              }}>
                ⚠️ You haven't added any lessons yet. You can add them after publishing.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-ghost" onClick={() => setStep(2)}>
                <ChevronLeft size={16} /> Back
              </button>
              <button className="btn-primary" style={{ fontSize: '15px', padding: '12px 28px' }} onClick={handlePublish} disabled={publishing}>
                {publishing ? <><span className="spinner-sm" /> Publishing...</> : <><Check size={16} /> Publish Course</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseCreate
