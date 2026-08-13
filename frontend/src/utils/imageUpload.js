/** Read an image file and return a compressed data-URL for localStorage-safe storage. */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Invalid image'))
    img.src = src
  })
}

/**
 * Downscale + re-encode an image file so it fits comfortably in localStorage.
 * Returns a JPEG data-URL (max dimension ~maxSize).
 */
export async function fileToDataUrl(file, maxSize = 900) {
  const raw = await readFileAsDataUrl(file)
  const img = await loadImage(raw)

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  if (scale === 1 && file.type !== 'image/jpeg') {
    return raw
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return raw
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function isValidImageUrl(url) {
  if (!url) return false
  return /^(https?:\/\/|data:image\/)/i.test(url.trim())
}