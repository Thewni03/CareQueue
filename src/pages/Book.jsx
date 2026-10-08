import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import { useCountUp, usePoll } from '../hooks'
import { dayLabel, money, time12 } from '../fmt'
import PaymentModal from '../components/PaymentModal.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import TokenStrip from '../components/TokenStrip.jsx'
import { Avatar, Empty, ErrorNote, Skeleton } from '../components/ui.jsx'

const STEPS = ['Hospital', 'Specialty', 'Doctor']

function Stat({ value, label }) {
  const n = useCountUp(value)
  return <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm"><p className="text-3xl font-extrabold tabular-nums">{n}</p><p className="text-xs text-teal-50">{label}</p></div>
}

function Hero({ hospitals }) {
  const specs = new Set((hospitals || []).flatMap((h) => h.specializations)).size
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lift sm:p-8">
      <span aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 animate-float rounded-full bg-white/10" />
      <span aria-hidden="true" className="absolute -bottom-14 right-28 h-32 w-32 animate-float rounded-full bg-white/10 [animation-delay:2s]" />
      <p className="relative text-sm font-semibold text-teal-50">Skip the waiting room</p>
      <h2 className="relative mt-1 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">Your health, our priority.</h2>
      <p className="relative mt-2 max-w-md text-sm text-teal-50">Book a doctor, get a live token, and arrive just in time. We'll alert you when your turn is close.</p>
      <div className="relative mt-5 grid max-w-md grid-cols-3 gap-3">
        <Stat value={hospitals ? hospitals.length : 0} label="Hospitals" />
        <Stat value={specs} label="Specialties" />
        <Stat value={5} label="Ahead when we alert you" />
      </div>
    </section>
  )
}

function CapacityRing({ taken, max }) {
  const c = 2 * Math.PI * 16, f = Math.min(1, taken / max)
  return (
    <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`${taken} of ${max} tokens booked`}>
      <svg aria-hidden="true" viewBox="0 0 40 40" className="-rotate-90"><circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-slate-100" />
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" strokeLinecap="round" className={f > 0.85 ? 'stroke-red-600' : 'stroke-teal-600'} strokeDasharray={c} strokeDashoffset={c * (1 - f)} style={{ transition: 'stroke-dashoffset .6s' }} /></svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-[11px] font-bold leading-none tabular-nums text-slate-700">{taken}<span className="text-[9px] font-medium text-slate-500">/{max}</span></span>
    </div>
  )
}

function SessionCard({ s, open, onOpen, onBook, user, busy }) {
  const [board, setBoard] = useState(null)
  usePoll(() => open && api(`/sessions/${s.id}/tokens`).then(setBoard).catch(() => {}), 4000, [open, s.id])  // live token preview
  const full = s.nextToken == null
  return (
    <section className={`card ${open ? 'border-teal-600 shadow-lift ring-2 ring-teal-600/20' : 'hover:-translate-y-0.5 hover:shadow-lift'}`}>
      <button className="flex w-full items-center gap-4 text-left" onClick={onOpen} aria-expanded={open}>
        <Avatar name={s.doctorName} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">{s.doctorName}</h3>
          <p className="text-sm text-slate-600">{dayLabel(s.date)}, arrives {time12(s.startTime)}</p>
          <p className="text-xs text-slate-500">{money(s.fee)} consultation</p>
        </div>
        <div className="text-right"><p className="text-[11px] font-semibold text-slate-500">{full ? 'FULL' : 'NEXT TOKEN'}</p>
          <p className={`text-3xl font-extrabold tabular-nums ${full ? 'text-red-600' : 'text-emerald-600'}`}>{full ? '–' : `#${s.nextToken}`}</p></div>
        <CapacityRing taken={s.taken} max={s.maxTokens} />
      </button>
      {open && (
        <div className="mt-4 animate-fade-up space-y-4 border-t border-slate-100 pt-4">
          <TokenStrip board={board} />
          {user?.role === 'PATIENT'
            ? <button className="btn-confirm w-full py-3 text-base" disabled={full || busy} onClick={() => onBook(s)}>{full ? 'Session full' : busy ? 'Reserving…' : `Reserve token #${s.nextToken}`}</button>
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
  const back = (i) => { if (i === 0) { setHospital(null); setSpec(null) } else if (i === 1) setSpec(null); setOpenId(null) }
  const book = async (s) => {
    setBusy(true); setError('')
    try { setHeld(await api('/appointments/book', { method: 'POST', body: { sessionId: s.id } })) } catch (e) { setError(e.message); loadSessions() } finally { setBusy(false) }
  }
  const chosen = [hospital?.name, spec]

  return (
    <div className="space-y-5">
      {step === 0 && <Hero hospitals={hospitals} />}

      <nav aria-label="Booking progress" className="card p-4">
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <ol className="grid grid-cols-3 gap-2 text-sm">
          {STEPS.map((l, i) => (
            <li key={l}>
              <button disabled={i >= step} onClick={() => back(i)} aria-current={i === step ? 'step' : undefined}
                className={`w-full rounded-xl px-2 py-1.5 text-left transition ${i < step ? 'cursor-pointer hover:bg-teal-50' : ''}`}>
                <span className={`flex items-center gap-1.5 font-semibold ${i <= step ? 'text-teal-700' : 'text-slate-400'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${i < step ? 'bg-teal-600 text-white' : i === step ? 'border-2 border-teal-600' : 'border border-slate-300'}`}>{i < step ? '✓' : i + 1}</span>{l}
                </span>
                {i < step && <span className="mt-0.5 block truncate pl-6 text-xs text-slate-500">{chosen[i]}</span>}
              </button>
            </li>))}
        </ol>
      </nav>
      <ErrorNote>{error}</ErrorNote>

      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Where do you want to be seen?</h2>
          {!hospitals ? <div className="space-y-3"><Skeleton /><Skeleton /></div> : hospitals.length === 0 ? <Empty>No hospitals are open for booking yet.</Empty> : (
            <div className="stagger space-y-3">
              {hospitals.map((h) => (
                <button key={h.id} onClick={() => setHospital(h)} className="card group flex w-full items-center gap-4 text-left hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-lift">
                  <Avatar name={h.name} className="h-14 w-14 text-lg" />
                  <span className="min-w-0 flex-1"><span className="block font-bold">{h.name}</span><span className="block text-sm text-slate-600">{h.address || h.city}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5">{h.specializations.map((x) => <span key={x} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{x}</span>)}</span></span>
                  <span aria-hidden="true" className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-600">→</span>
                </button>))}
            </div>)}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Which specialty?</h2>
          <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hospital.specializations.map((s) => (
              <button key={s} onClick={() => setSpec(s)} className="card group flex flex-col items-center gap-3 py-6 text-center hover:-translate-y-1 hover:border-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-lift">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white"><SpecIcon name={s} className="h-7 w-7" /></span>
                <span className="font-bold">{s}</span>
              </button>))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Pick a doctor and session</h2>
          <p className="text-sm text-slate-600">Tap a session to see which tokens are taken. Availability updates live.</p>
          {!sessions ? <div className="space-y-3"><Skeleton /><Skeleton /></div> : sessions.length === 0 ? <Empty>No upcoming {spec} sessions here. Try another specialty or hospital.</Empty> :
            <div className="stagger space-y-3">{sessions.map((s) => <SessionCard key={s.id} s={s} user={user} busy={busy} open={openId === s.id} onOpen={() => setOpenId(openId === s.id ? null : s.id)} onBook={book} />)}</div>}
        </div>
      )}

      {held && <PaymentModal appointment={held} onClose={() => { setHeld(null); loadSessions() }} onPaid={() => nav('/appointments')} />}
    </div>
  )
}