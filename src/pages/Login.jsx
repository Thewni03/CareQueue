import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homeFor, useAuth } from '../auth.jsx'
import AuthShell from '../components/AuthShell.jsx'
import { ErrorNote } from '../components/ui.jsx'

const DEMOS = [['Patient', 'patient@demo.lk'], ['Hospital', 'staff@demo.lk'], ['Pharmacy', 'pharmacy@demo.lk'], ['Admin', 'admin@demo.lk']]
const Eye = ({ off }) => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}</svg>

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [forgot, setForgot] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { nav(homeFor((await login(email, password)).role)) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <AuthShell>
      <form onSubmit={submit} className="space-y-4">
        <div><h2 className="text-2xl font-extrabold">Welcome back</h2><p className="text-sm text-slate-500">Sign in to book, track and manage.</p></div>
        <ErrorNote>{error}</ErrorNote>
        <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required autoComplete="email" className="input rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="p">Password</label>
          <div className="relative"><input id="p" type={show ? 'text' : 'password'} required autoComplete="current-password" className="input rounded-2xl pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:text-teal-700"><Eye off={show} /></button></div></div>
        <button className="btn w-full bg-sage-600 py-3 text-base text-white hover:bg-sage-700" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <div className="text-center text-sm">
          <button type="button" className="font-semibold text-slate-600 hover:text-teal-700" onClick={() => setForgot(!forgot)} aria-expanded={forgot}>Forgot password?</button>
          {forgot && <p className="mt-2 animate-fade-up rounded-xl bg-sage-50 px-3 py-2 text-slate-600">Password reset isn't available yet. Ask your hospital or an admin to reset it for you.</p>}
        </div>
        <p className="text-center text-sm text-slate-600">New here? <Link className="font-bold text-teal-700 hover:underline" to="/register">Create an account</Link></p>
        <div className="border-t border-slate-200 pt-3">
          <p className="mb-2 text-xs text-slate-500">Demo accounts (password demo1234). Tap to fill:</p>
          <div className="flex flex-wrap gap-2">{DEMOS.map(([l, m]) => <button key={m} type="button" onClick={() => { setEmail(m); setPassword('demo1234') }} className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700 transition hover:scale-105 hover:bg-sage-200">{l}</button>)}</div>
        </div>
      </form>
    </AuthShell>
  )
}