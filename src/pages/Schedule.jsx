import { useState } from 'react'
import { api } from '../api'
import { usePoll } from '../hooks'
import { dayLabel, money, time12 } from '../fmt'
import DoctorAvatar from '../components/DoctorAvatar.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import { Empty, ErrorNote, StatTile } from '../components/ui.jsx'

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const todayISO = () => iso(new Date())
const tomorrowISO = () => iso(new Date(Date.now() + 86400000))
const TIMES = Array.from({ length: 33 }, (_, i) => { const m = 360 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` })  // 06:00 to 22:00
const TOKENS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100]

/** One doctor, three selectable fields (date, arrival time, max tokens) and a publish button. */
function DoctorCard({ doc, onPublish }) {
  const [f, setF] = useState({ date: todayISO(), startTime: '16:00', maxTokens: 20 })
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const publish = async () => {
    setBusy(true)
    const ok = await onPublish(doc, { ...f, maxTokens: Number(f.maxTokens) })
    setBusy(false)
    if (ok) { setDone(true); setTimeout(() => setDone(false), 2200) }
  }
  const quick = (d, label) => <button type="button" onClick={() => setF({ ...f, date: d })} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${f.date === d ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'}`}>{label}</button>
  return (
    <div className="card flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center gap-3">
        <DoctorAvatar name={doc.name} className="h-14 w-14 shrink-0" />
        <div className="min-w-0"><p className="truncate font-bold">{doc.name}</p><p className="text-xs text-slate-500">{doc.specialization} · {money(doc.fee)}</p></div>
      </div>
      <div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">Quick pick</span>{quick(todayISO(), 'Today')}{quick(tomorrowISO(), 'Tomorrow')}</div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="label text-xs" htmlFor={`d-${doc.id}`}>Date</label><input id={`d-${doc.id}`} type="date" min={todayISO()} className="input px-2" value={f.date} onChange={set('date')} /></div>
        <div><label className="label text-xs" htmlFor={`t-${doc.id}`}>Arrives</label>
          <select id={`t-${doc.id}`} className="input px-2" value={f.startTime} onChange={set('startTime')}>{TIMES.map((t) => <option key={t} value={t}>{time12(t)}</option>)}</select></div>
        <div><label className="label text-xs" htmlFor={`m-${doc.id}`}>Max tokens</label>
          <select id={`m-${doc.id}`} className="input px-2" value={f.maxTokens} onChange={set('maxTokens')}>{TOKENS.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <button type="button" className={done ? 'btn-teal w-full' : 'btn-confirm w-full'} disabled={busy} onClick={publish}>{busy ? 'Publishing…' : done ? 'Published ✓' : 'Publish session'}</button>
    </div>
  )
}

export default function Schedule() {
  const [doctors, setDoctors] = useState([]); const [sessions, setSessions] = useState(null); const [error, setError] = useState('')
  const [d, setD] = useState({ name: '', specialization: '', fee: 1500 }); const [showAdd, setShowAdd] = useState(false)
  const [open, setOpen] = useState(null); const [patients, setPatients] = useState(null)

  const load = () => Promise.all([api('/hospital/doctors'), api('/hospital/sessions')]).then(([a, b]) => { setDoctors(a); setSessions(b) }).catch((e) => setError(e.message))
  usePoll(load, 10000, [])

  const addDoctor = async (e) => {
    e.preventDefault(); setError('')
    try { await api('/hospital/doctors', { method: 'POST', body: { ...d, fee: Number(d.fee) } }); setD({ name: '', specialization: '', fee: 1500 }); setShowAdd(false); await load() } catch (x) { setError(x.message) }
  }
  const publish = async (doc, f) => {
    setError('')
    try { await api('/hospital/sessions', { method: 'POST', body: { doctorId: doc.id, ...f } }); await load(); return true } catch (x) { setError(x.message); return false }
  }
  const toggle = async (id) => { if (open === id) return setOpen(null); setOpen(id); setPatients(null); try { setPatients((await api(`/hospital/sessions/${id}/patients`)).patients) } catch (e) { setError(e.message) } }

  const groups = Object.entries(doctors.reduce((m, x) => { (m[x.specialization] = m[x.specialization] || []).push(x); return m }, {})).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-teal-700">Doctors & sessions</h2>
        <button className={showAdd ? 'btn-outline' : 'btn-teal'} onClick={() => setShowAdd(!showAdd)} aria-expanded={showAdd}>{showAdd ? 'Close' : 'Add a doctor'}</button>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Doctors" value={doctors.length} />
        <StatTile label="Upcoming sessions" value={sessions ? sessions.length : 0} tone="green" />
        <StatTile label="Tokens booked" value={(sessions || []).reduce((n, x) => n + x.taken, 0)} tone="blue" hint="across upcoming sessions" />
      </div>

      {showAdd && (
        <form onSubmit={addDoctor} className="card animate-fade-up space-y-3">
          <h3 className="font-bold">Add a doctor</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="dn">Name</label><input id="dn" required className="input" placeholder="Dr. Nimali Perera" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="ds">Specialization</label><input id="ds" required list="specs" className="input" placeholder="Cardiology" value={d.specialization} onChange={(e) => setD({ ...d, specialization: e.target.value })} />
              <datalist id="specs">{['Cardiology', 'Pediatrics', 'General Medicine', 'Dermatology', 'Orthopedics', 'ENT'].map((x) => <option key={x} value={x} />)}</datalist></div>
            <div><label className="label" htmlFor="df">Consultation fee (LKR)</label><input id="df" type="number" min="0" required className="input" value={d.fee} onChange={(e) => setD({ ...d, fee: e.target.value })} /></div>
          </div>
          <button className="btn-teal">Save doctor</button>
        </form>)}

      <section className="space-y-5">
        <div><h3 className="font-bold">Schedule a session</h3><p className="text-sm text-slate-600">Choose a date, arrival time and token limit on a doctor's card, then publish.</p></div>
        {doctors.length === 0 ? <Empty>No doctors yet. Use “Add a doctor” first.</Empty> : groups.map(([spec, list]) => (
          <div key={spec} className="space-y-3">
            <h4 className="flex items-center gap-2 text-base font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700"><SpecIcon name={spec} className="h-4 w-4" /></span>{spec} doctors<span className="rounded-full bg-teal-50 px-2 text-xs font-bold text-teal-700">{list.length}</span></h4>
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((doc) => <DoctorCard key={doc.id} doc={doc} onPublish={publish} />)}</div>
          </div>))}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold">Upcoming sessions</h3>
        {!sessions ? <Empty>Loading…</Empty> : sessions.length === 0 ? <Empty>No sessions yet. Publish the first one above.</Empty> : sessions.map((x) => (
          <div key={x.id} className="card">
            <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => toggle(x.id)} aria-expanded={open === x.id}>
              <div><p className="font-bold">{x.doctorName} <span className="font-normal text-slate-500">· {x.specialization}</span></p><p className="text-sm text-slate-600">{dayLabel(x.date)}, {time12(x.startTime)} · {money(x.fee)}</p></div>
              <p className="text-sm font-semibold text-teal-700">{x.taken}/{x.maxTokens} booked</p>
            </button>
            {open === x.id && (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 text-sm">
                {!patients ? <li className="py-3 text-slate-500">Loading patients…</li> : patients.length === 0 ? <li className="py-3 text-slate-500">No patients booked yet.</li> :
                  patients.map((p) => <li key={p.appointmentId} className="flex justify-between py-2"><span>#{p.tokenNumber} {p.patientName}</span><span className="text-slate-500">{p.status.toLowerCase()}</span></li>)}
              </ul>)}
          </div>))}
      </section>
    </div>
  )
}