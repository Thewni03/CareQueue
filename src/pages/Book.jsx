import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import { usePoll } from '../hooks'
import { dayLabel, money, time12 } from '../fmt'
import PaymentModal from '../components/PaymentModal.jsx'
import TokenStrip from '../components/TokenStrip.jsx'
import { Empty, ErrorNote } from '../components/ui.jsx'

const STEPS = ['Hospital', 'Specialty', 'Doctor', 'Token']

function SessionCard({ s, open, onOpen, onBook, user, busy }) {
  const [board, setBoard] = useState(null)
  usePoll(() => open && api(`/sessions/${s.id}/tokens`).then(setBoard).catch(() => {}), 4000, [open, s.id])  // live token preview
  const full = s.nextToken == null
  return (
    <section className={`card transition-shadow ${open ? 'ring-2 ring-teal-600' : ''}`}>
      <button className="flex w-full items-center justify-between gap-3 text-left" onClick={onOpen} aria-expanded={open}>
        <div>
          <h3 className="font-bold">{s.doctorName}</h3>
          <p className="text-sm text-slate-600">{dayLabel(s.date)}, arrives {time12(s.startTime)} · {money(s.fee)}</p>
        </div>
        <div className="text-right"><p className="text-xs text-slate-500">{full ? 'Full' : 'Next token'}</p>
          <p className={`text-3xl font-extrabold tabular-nums ${full ? 'text-red-600' : 'text-emerald-600'}`}>{full ? '–' : `#${s.nextToken}`}</p></div>
      </button>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(s.taken / s.maxTokens) * 100}%` }} /></div>
      <p className="mt-1 text-xs text-slate-500">{s.taken} of {s.maxTokens} tokens booked</p>
      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <TokenStrip board={board} />
          {user?.role === 'PATIENT'
            ? <button className="btn-confirm w-full" disabled={full || busy} onClick={() => onBook(s)}>{full ? 'Session full' : busy ? 'Reserving…' : `Reserve token #${s.nextToken}`}</button>
            : user ? <p className="text-sm text-slate-500">Only patient accounts can book.</p>
            : <Link to="/login" className="btn-outline w-full">Sign in to book</Link>}
        </div>
      )}
    </section>
  )
}

export default function Book() {
  const { user } = useAuth(); const nav = useNavigate()
  const [hospitals, setHospitals] = useState(null)
  const [hospital, setHospital] = useState(null); const [spec, setSpec] = useState(null)
  const [sessions, setSessions] = useState(null); const [openId, setOpenId] = useState(null)
  const [held, setHeld] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('')

  useEffect(() => { api('/hospitals').then(setHospitals).catch((e) => setError(e.message)) }, [])
  const loadSessions = () => hospital && api(`/doctors/availability?hospitalId=${hospital.id}&specialization=${encodeURIComponent(spec)}`).then(setSessions).catch((e) => setError(e.message))
  useEffect(() => { setSessions(null); if (hospital && spec) loadSessions() }, [hospital, spec])
  usePoll(() => hospital && spec && loadSessions(), 8000, [hospital, spec])

  const step = !hospital ? 0 : !spec ? 1 : 2
  const book = async (s) => {
    setBusy(true); setError('')
    try { setHeld(await api('/appointments/book', { method: 'POST', body: { sessionId: s.id } })) } catch (e) { setError(e.message); loadSessions() } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <ol className="flex items-center gap-2 text-xs font-semibold" aria-label="Booking progress">
        {STEPS.map((l, i) => (
          <li key={l} className="flex flex-1 items-center gap-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i < step + 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
            <span className={i <= step ? 'text-slate-800' : 'text-slate-400'}>{l}</span>
            <span className="h-px flex-1 bg-slate-200" />
          </li>
        ))}
      </ol>

      {(hospital || spec) && (
        <div className="flex flex-wrap gap-2 text-sm">
          {hospital && <button className="btn-outline px-3 py-1.5" onClick={() => { setHospital(null); setSpec(null) }}>{hospital.name} ✕</button>}
          {spec && <button className="btn-outline px-3 py-1.5" onClick={() => { setSpec(null); setOpenId(null) }}>{spec} ✕</button>}
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>

      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Where do you want to be seen?</h2>
          {!hospitals ? <Empty>Loading hospitals…</Empty> : hospitals.length === 0 ? <Empty>No hospitals are open for booking yet.</Empty> :
            hospitals.map((h) => (
              <button key={h.id} onClick={() => setHospital(h)} className="card block w-full text-left hover:border-teal-600">
                <p className="font-bold">{h.name}</p><p className="text-sm text-slate-600">{h.address || h.city}</p>
                <p className="mt-2 text-xs text-slate-500">{h.specializations.join(', ')}</p>
              </button>))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Which specialty?</h2>
          <div className="flex flex-wrap gap-2">
            {hospital.specializations.map((s) => <button key={s} onClick={() => setSpec(s)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-700">{s}</button>)}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Pick a doctor and session</h2>
          <p className="text-sm text-slate-600">Tap a session to see which tokens are taken. Availability updates live.</p>
          {!sessions ? <Empty>Loading sessions…</Empty> : sessions.length === 0 ? <Empty>No upcoming {spec} sessions here. Try another specialty or hospital.</Empty> :
            sessions.map((s) => <SessionCard key={s.id} s={s} user={user} busy={busy} open={openId === s.id} onOpen={() => setOpenId(openId === s.id ? null : s.id)} onBook={book} />)}
        </div>
      )}

      {held && <PaymentModal appointment={held} onClose={() => { setHeld(null); loadSessions() }} onPaid={() => nav('/appointments')} />}
    </div>
  )
}
