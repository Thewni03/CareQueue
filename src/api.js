const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const getToken = () => localStorage.getItem('token')

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }
  if (res.status === 401 && token) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login' }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { const j = await res.json(); if (j.message) msg = j.message; else if (j.error) msg = j.error } catch {}
    throw new Error(msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
