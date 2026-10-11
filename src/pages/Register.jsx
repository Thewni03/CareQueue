import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import AuthShell from '../components/AuthShell.jsx'
import { ErrorNote } from '../components/ui.jsx'

const strength = (p) => [p.length >= 6, p.length >= 10, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p) && /[^A-Za-z0-9]/.test(p)].filter(Boolean).length

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const sc = strength(f.password)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { await register(f); nav('/') } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <AuthShell>
      <form onSubmit={submit} className="space-y-3.5">
        <div><h2 className="text-2xl font-extrabold">Create your account</h2><p className="text-sm text-slate-500">Free for patients. Takes a minute.</p></div>
        <ErrorNote>{error}</ErrorNote>
        <div><label className="label" htmlFor="n">Full name</label><input id="n" required autoComplete="name" className="input rounded-2xl" value={f.name} onChange={set('name')} /></div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required autoComplete="email" className="input rounded-2xl" value={f.email} onChange={set('email')} /></div>
        <div><label className="label" htmlFor="ph">Mobile number</label><input id="ph" type="tel" autoComplete="tel" className="input rounded-2xl" value={f.phone} onChange={set('phone')} /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" minLength={6} required autoComplete="new-password" className="input rounded-2xl" value={f.password} onChange={set('password')} />
          <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= sc ? (sc < 2 ? 'bg-red-500' : sc < 4 ? 'bg-teal-500' : 'bg-emerald-600') : 'bg-slate-200'}`} />)}</div>
          <p className="mt-1 text-xs text-slate-500">{f.password ? ['Too short', 'Okay', 'Good', 'Strong'][Math.max(0, sc - 1)] || 'Too short' : 'Use at least 6 characters'}</p></div>
        <button className="btn w-full bg-sage-600 py-3 text-base text-white hover:bg-sage-700" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="text-center text-sm text-slate-600">Already registered? <Link className="font-bold text-teal-700 hover:underline" to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  )
}