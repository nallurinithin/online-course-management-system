import React, { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle, AlertCircle, Film, X } from 'lucide-react'
import { getPresignedUrl, uploadToS3WithProgress } from '../services/uploadService'
import toast from 'react-hot-toast'

function VideoUploader({ onUploadComplete, courseId, lessonId, acceptTypes = 'video/*', label = 'Upload Video', hint = 'MP4, MOV, AVI — Max 500MB' }) {
  const [state, setState] = useState('idle') // idle | selected | uploading | success | error
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateFile = (f) => {
    if (!f) return 'No file selected'
    const isVideo = f.type.startsWith('video/') || acceptTypes === 'image/*' ? f.type.startsWith('image/') : f.type.startsWith('video/')
    const maxSize = 500 * 1024 * 1024
    if (f.size > maxSize) return 'File exceeds 500MB limit'
    return null
  }

  const handleFileSelect = (f) => {
    setErrorMsg('')
    const err = validateFile(f)
    if (err) {
      setErrorMsg(err)
      return
    }
    setFile(f)
    setState('selected')
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleUpload = async () => {
    if (!file) return
    setState('uploading')
    setProgress(0)
    setErrorMsg('')

    try {
      const s3Prefix = courseId ? `courses/${courseId}/lessons` : 'uploads'
      const { data } = await getPresignedUrl(file.name, file.type, s3Prefix)
      const { presigned_url, s3_key } = data

      await uploadToS3WithProgress(presigned_url, file, (pct) => {
        setProgress(pct)
      })

      setState('success')
      onUploadComplete(s3_key)
      toast.success('Upload complete!')
    } catch (err) {
      setState('error')
      setErrorMsg(err.message || 'Upload failed. Please try again.')
      toast.error('Upload failed')
    }
  }

  const handleReset = () => {
    setState('idle')
    setFile(null)
    setProgress(0)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Drop Zone */}
      {state === 'idle' || state === 'selected' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => state === 'idle' && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#3b82f6' : state === 'selected' ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: state === 'idle' ? 'pointer' : 'default',
            transition: 'all 0.3s',
            background: dragOver ? 'rgba(59,130,246,0.05)' : state === 'selected' ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            style={{ display: 'none' }}
            onChange={e => handleFileSelect(e.target.files[0])}
          />

          {state === 'idle' ? (
            <>
              <div style={{
                width: '52px', height: '52px', margin: '0 auto 14px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Upload size={22} color="#3b82f6" />
              </div>
              <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                {label}
              </p>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>
                Drag & drop or <span style={{ color: '#3b82f6' }}>browse files</span>
              </p>
              <p style={{ color: '#475569', fontSize: '11px' }}>{hint}</p>
            </>
          ) : (
            /* Selected State */
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div style={{
                width: '48px', height: '48px', flexShrink: 0,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Film size={20} color="#10b981" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file?.name}
                </p>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                  {file ? formatBytes(file.size) : ''}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : state === 'uploading' ? (
        /* Upload Progress */
        <div style={{
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px',
          padding: '24px 20px',
          background: 'rgba(59,130,246,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            <div>
              <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>Uploading...</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>{file?.name}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#3b82f6', fontWeight: 700, fontSize: '16px' }}>
              {progress}%
            </span>
          </div>
          {/* Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      ) : state === 'success' ? (
        /* Success */
        <div style={{
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '12px',
          padding: '20px',
          background: 'rgba(16,185,129,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>Upload Complete</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>{file?.name}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn-ghost"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Replace
          </button>
        </div>
      ) : (
        /* Error */
        <div style={{
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          padding: '20px',
          background: 'rgba(239,68,68,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#ef4444" />
            <div>
              <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>Upload Failed</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>{errorMsg}</p>
            </div>
          </div>
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Error below drop zone */}
      {errorMsg && (state === 'idle' || state === 'selected') && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{errorMsg}</p>
      )}

      {/* Upload Button */}
      {state === 'selected' && (
        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
          onClick={handleUpload}
        >
          <Upload size={15} /> Upload File
        </button>
      )}
    </div>
  )
}

export default VideoUploader
