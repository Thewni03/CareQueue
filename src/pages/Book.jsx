import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import { usePoll } from '../hooks'
import { getHospitalImage } from '../lib/images'
import { PROVINCE_ORDER, provinceOf } from '../lib/provinces'
import { dayLabel, time12 } from '../fmt'
import DoctorAvatar from '../components/DoctorAvatar.jsx'
import HospitalCard from '../components/HospitalCard.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import StepJourney from '../components/StepJourney.jsx'
import TokenStrip from '../components/TokenStrip.jsx'
import { Empty, ErrorNote, Skeleton } from '../components/ui.jsx'

const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

/** Booking circle: how full the session is, with the next token in the middle. */
function BookingRing({ taken, max, next, size = 'h-14 w-14', big = false }) {
  const r = 16, c = 2 * Math.PI * r, f = Math.min(1, taken / max)
  return (
    <span className={`relative inline-block shrink-0 ${size}`} role="img" aria-label={`${taken} of ${max} tokens booked`}>
      <svg aria-hidden="true" viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-slate-200" />
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" strokeLinecap="round" className={f > 0.85 ? 'stroke-red-600' : 'stroke-teal-600'} strokeDasharray={c} strokeDashoffset={c * (1 - f)} style={{ transition: 'stroke-dashoffset .8s' }} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none tabular-nums">
        {big ? <><span className="text-[10px] font-semibold text-slate-500">TOKEN</span><span className={`text-3xl font-extrabold ${next ? 'text-emerald-600' : 'text-red-600'}`}>{next ? `#${next}` : 'Full'}</span></>
          : <><span className="text-[11px] font-bold text-slate-700">{taken}</span><span className="text-[9px] text-slate-500">/{max}</span></>}
      </span>
    </span>
  )
}

function DoctorRow({ s, selected, onPick }) {
  const full = s.nextToken == null, today = s.date === todayISO()
  const [label, dot] = full ? ['Full', 'bg-red-500'] : today ? ['Available today', 'bg-emerald-500'] : ['Upcoming', 'bg-teal-500']
  return (
    <button type="button" onClick={() => onPick(s.id)} aria-pressed={selected}
      className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition duration-200 ${selected ? 'border-2 border-dashed border-sage-300 bg-sage-700 text-white shadow-lift' : 'border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-lift'}`}>
      <DoctorAvatar name={s.doctorName} className="h-14 w-14 shrink-0 ring-2 ring-white/60" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{s.doctorName}</span>
        <span className={`block truncate text-xs ${selected ? 'text-sage-100' : 'text-slate-500'}`}>{s.specialization}</span>
        <span className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ${selected ? 'text-sage-100' : 'text-slate-600'}`}>
          <span className="flex items-center gap-1"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{dayLabel(s.date)}, {time12(s.startTime)}</span>
          <span className="flex items-center gap-1"><i className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>
        </span>
      </span>
      <span className="text-right"><span className={`block text-[10px] font-semibold ${selected ? 'text-sage-100' : 'text-slate-500'}`}>NEXT TOKEN</span>
        <span className={`block text-2xl font-extrabold tabular-nums ${full ? 'text-red-400' : selected ? 'text-white' : 'text-emerald-600'}`}>{full ? '–' : `#${s.nextToken}`}</span></span>
      <span className={selected ? 'rounded-full bg-white p-0.5' : ''}><BookingRing taken={s.taken} max={s.maxTokens} /></span>
    </button>
  )
}

function DoctorPanel({ s, user, busy, onBook }) {
  const [board, setBoard] = useState(null)
  usePoll(() => api(`/sessions/${s.id}/tokens`).then(setBoard).catch(() => {}), 4000, [s.id])
  const full = s.nextToken == null
  return (
    <aside className="card relative overflow-hidden p-0 md:sticky md:top-24">
      <div className="relative bg-sage-100 px-5 pb-6 pt-8 text-center">
        <span aria-hidden="true" className="absolute -left-10 -top-8 h-36 w-36 rounded-[60%_40%_55%_45%] bg-sage-300/70" />
        <span aria-hidden="true" className="absolute -right-8 top-10 h-28 w-28 animate-float rounded-[45%_55%_40%_60%] bg-sage-400/50" />
        <DoctorAvatar name={s.doctorName} className="relative mx-auto h-28 w-28 ring-4 ring-white" />
        <h3 className="relative mt-3 text-lg font-extrabold text-slate-800">{s.doctorName}</h3>
        <p className="relative text-sm text-slate-600">{s.specialization}</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <span className="rounded-xl bg-sage-50 px-2 py-2"><span className="block text-[11px] text-slate-500">Date</span><span className="font-bold">{dayLabel(s.date)}</span></span>
          <span className="rounded-xl bg-sage-50 px-2 py-2"><span className="block text-[11px] text-slate-500">Arrives</span><span className="font-bold">{time12(s.startTime)}</span></span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <BookingRing taken={s.taken} max={s.maxTokens} next={s.nextToken} size="h-28 w-28" big />
          <p className="text-sm text-slate-600"><b className="text-lg text-slate-800">{s.taken}</b> of {s.maxTokens}<br />tokens booked</p>
        </div>
        <TokenStrip board={board} />
        {user?.role === 'PATIENT'
          ? <button className="btn-confirm w-full py-3 text-base" disabled={full || busy} onClick={() => onBook(s)}>{full ? 'Session full' : busy ? 'Reserving…' : `Reserve token #${s.nextToken}`}</button>
          : user ? <p className="text-center text-sm text-slate-500">Only patient accounts can book.</p>
          : <Link to="/login" className="btn-outline w-full">Sign in to book</Link>}
      </div>
    </aside>
  )
}

export default function Book() {
  const { user } = useAuth(); const nav = useNavigate(); const [sp] = useSearchParams()
  const [hospitals, setHospitals] = useState(null)
  const [hospital, setHospital] = useState(null); const [spec, setSpec] = useState(null)
  const [sessions, setSessions] = useState(null); const [pick, setPick] = useState(null)
  const [held, setHeld] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const [q, setQ] = useState(''); const [prov, setProv] = useState('All')

  useEffect(() => { api('/hospitals').then(setHospitals).catch((e) => setError(e.message)) }, [])
  useEffect(() => { // deep links from the home page: /book?hospital=ID&spec=Cardiology
    if (!hospitals || hospital) return
    const h = hospitals.find((x) => x.id === sp.get('hospital'))
    if (h) { setHospital(h); const s = sp.get('spec'); if (s && h.specializations.includes(s)) setSpec(s) }
  }, [hospitals])

  const loadSessions = () => hospital && spec && api(`/doctors/availability?hospitalId=${hospital.id}&specialization=${encodeURIComponent(spec)}`)
    .then((l) => { setSessions(l); setPick((p) => (l.some((x) => x.id === p) ? p : l[0]?.id ?? null)) }).catch((e) => setError(e.message))
  useEffect(() => { setSessions(null); setPick(null); loadSessions() }, [hospital, spec])
  usePoll(() => loadSessions(), 8000, [hospital, spec])

  const step = !hospital ? 0 : !spec ? 1 : 2
  const back = (i) => { if (i === 0) { setHospital(null); setSpec(null) } else if (i === 1) setSpec(null) }
  const book = async (s) => {
    setBusy(true); setError('')
    try { setHeld(await api('/appointments/book', { method: 'POST', body: { sessionId: s.id } })) } catch (e) { setError(e.message); loadSessions() } finally { setBusy(false) }
  }

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase(), by = {}
    ;(hospitals || []).forEach((h) => {
      const p = provinceOf(h)
      if (prov !== 'All' && p !== prov) return
      if (needle && !`${h.name} ${h.address} ${h.city} ${h.specializations.join(' ')}`.toLowerCase().includes(needle)) return
      ;(by[p] ||= []).push(h)
    })
    return PROVINCE_ORDER.filter((p) => by[p]).map((p) => [p, by[p]])
  }, [hospitals, q, prov])
  const chosen = sessions?.find((x) => x.id === pick)

  return (
    <div className="space-y-5">
      <StepJourney step={step} hospital={hospital} spec={spec} onBack={back} />
      <ErrorNote>{error}</ErrorNote>

      {step === 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-lg font-bold text-teal-700">Where do you want to be seen?</h2><p className="text-sm text-slate-600">Pick a hospital to see its specialties.</p></div>
            <input className="input max-w-xs" type="search" placeholder="Search hospital or specialty" aria-label="Search hospitals" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by province">
            {['All', ...PROVINCE_ORDER].map((p) => <button key={p} type="button" aria-pressed={prov === p} onClick={() => setProv(p)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${prov === p ? 'bg-teal-600 text-white shadow' : 'border border-slate-300 bg-white text-slate-600 hover:border-teal-600 hover:text-teal-700'}`}>{p.replace(' Province', '').replace(' provinces', '')}</button>)}
          </div>
          {!hospitals ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
            : groups.length === 0 ? <Empty>No hospitals match that search.</Empty>
            : groups.map(([p, list]) => (
              <section key={p} aria-label={p}>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold"><span className="h-2.5 w-2.5 rounded-full bg-teal-600" />{p}<span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">{list.length}</span></h3>
                <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((h) => <HospitalCard key={h.id} h={h} province={p} image={getHospitalImage(h.id)} onSelect={setHospital} />)}
                </div>
              </section>))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-teal-700">Which specialty?</h2>
          <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hospital.specializations.map((s) => (
              <button key={s} onClick={() => setSpec(s)} className="card group flex flex-col items-center gap-3 py-6 text-center hover:-translate-y-1 hover:border-sage-500 hover:bg-sage-600 hover:text-white hover:shadow-lift">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white"><SpecIcon name={s} className="h-7 w-7" /></span>
                <span className="font-bold">{s}</span>
              </button>))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div><h2 className="text-lg font-bold text-teal-700">Pick a doctor and session</h2><p className="text-sm text-slate-600">Tap a doctor to see their tokens. Availability updates live.</p></div>
          {!sessions ? <div className="grid gap-4 md:grid-cols-5"><Skeleton className="h-72 md:col-span-3" /><Skeleton className="h-72 md:col-span-2" /></div>
            : sessions.length === 0 ? <Empty>No upcoming {spec} sessions here. Try another specialty or hospital.</Empty> : (
              <div className="grid items-start gap-5 md:grid-cols-5">
                <div className="stagger space-y-3 md:col-span-3">{sessions.map((s) => <DoctorRow key={s.id} s={s} selected={pick === s.id} onPick={setPick} />)}</div>
                <div className="md:col-span-2">{chosen && <DoctorPanel key={chosen.id} s={chosen} user={user} busy={busy} onBook={book} />}</div>
              </div>)}
        </div>
      )}

      {held && <PaymentModal appointment={held} onClose={() => { setHeld(null); loadSessions() }} onPaid={() => nav('/appointments')} />}
    </div>
  )
}