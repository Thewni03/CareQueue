/**
 * Hospital photos. The backend has no image field, so photos are saved in THIS browser only (localStorage).
 * Everyone else sees the generated illustration until the backend gains an imageUrl field.
 */
const key = (id) => `hospital-img:${id}`

export const getHospitalImage = (id) => { try { return localStorage.getItem(key(id)) } catch { return null } }
export const removeHospitalImage = (id) => { try { localStorage.removeItem(key(id)) } catch {} }
export function setHospitalImage(id, dataUrl) {
  try { localStorage.setItem(key(id), dataUrl); return true } catch { return false }
}

/** Resizes to max 900px wide and re-encodes as JPEG so it fits in localStorage. */
export function fileToDataUrl(file, maxW = 900) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    if (file.size > 8 * 1024 * 1024) return reject(new Error('That image is over 8 MB. Choose a smaller one.'))
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('Could not read that file.'))
    fr.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file is not a readable image.'))
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width)
        const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.8))
      }
      img.src = fr.result
    }
    fr.readAsDataURL(file)
  })
}

export const getAvatar = (id) => { try { return localStorage.getItem(`avatar:${id}`) } catch { return null } }
export const setAvatar = (id, url) => { try { localStorage.setItem(`avatar:${id}`, url); return true } catch { return false } }