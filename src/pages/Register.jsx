import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { ErrorNote } from '../components/ui.jsx'

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { await register(f); nav('/book') } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4">
      <h2 className="text-lg font-bold text-teal-700">Create your account</h2>
      <ErrorNote>{error}</ErrorNote>
      <div><label className="label" htmlFor="n">Full name</label><input id="n" required className="input" value={f.name} onChange={set('name')} /></div>
      <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
      <div><label className="label" htmlFor="ph">Mobile number</label><input id="ph" type="tel" className="input" value={f.phone} onChange={set('phone')} /></div>
      <div><label className="label" htmlFor="pw">Password (6+ characters)</label><input id="pw" type="password" minLength={6} required className="input" value={f.password} onChange={set('password')} /></div>
      <button className="btn-confirm w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-teal-700 hover:underline" to="/login">Sign in</Link></p>
    </form>
  )
}
