import api from './api'

export const getPresignedUrl = (filename, content_type, s3_prefix) =>
  api.post('/api/uploads/presigned-url', { filename, content_type, s3_prefix })

export const uploadToS3 = async (presignedUrl, file) => {
  // Direct PUT to S3 (or mock URL) — bypasses backend
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  return response
}

export const uploadToS3WithProgress = (presignedUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr)
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.send(file)
  })
}

export const getViewUrl = (s3_key) =>
  api.get(`/api/uploads/view-url/${encodeURIComponent(s3_key)}`)
