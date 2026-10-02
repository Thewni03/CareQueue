import { createContext, useContext, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })
  const save = (res) => { localStorage.setItem('token', res.token); localStorage.setItem('user', JSON.stringify(res.user)); setUser(res.user); return res.user }
  const login = async (email, password) => save(await api('/auth/login', { method: 'POST', body: { email, password } }))
  const register = async (form) => save(await api('/auth/register', { method: 'POST', body: form }))
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>
}

export const homeFor = (role) => ({ HOSPITAL: '/counter', PHARMACY: '/stock', ADMIN: '/admin' }[role] || '/book')
