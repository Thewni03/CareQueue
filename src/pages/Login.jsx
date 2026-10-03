import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homeFor, useAuth } from '../auth.jsx'
import { ErrorNote } from '../components/ui.jsx'

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { nav(homeFor((await login(email, password)).role)) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4">
      <h2 className="text-lg font-bold text-teal-700">Sign in</h2>
      <ErrorNote>{error}</ErrorNote>
      <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <button className="btn-teal w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="text-center text-sm text-slate-600">New here? <Link className="font-semibold text-teal-700 hover:underline" to="/register">Create an account</Link></p>
      <p className="border-t border-slate-200 pt-3 text-xs text-slate-500">Demo logins (password demo1234): patient@demo.lk, staff@demo.lk, pharmacy@demo.lk, admin@demo.lk</p>
    </form>
  )
}
