import { useState } from 'react'
import { api } from '../api'
import { usePoll } from '../hooks'
import { dayLabel, money, time12 } from '../fmt'
import { Empty, ErrorNote } from '../components/ui.jsx'

const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function Schedule() {
  const [doctors, setDoctors] = useState([]); const [sessions, setSessions] = useState(null); const [error, setError] = useState('')
  const [d, setD] = useState({ name: '', specialization: '', fee: 1500 })
  const [s, setS] = useState({ doctorId: '', date: todayISO(), startTime: '16:00', maxTokens: 20 })
  const [open, setOpen] = useState(null); const [patients, setPatients] = useState(null)

  const load = () => Promise.all([api('/hospital/doctors'), api('/hospital/sessions')]).then(([a, b]) => { setDoctors(a); setSessions(b) }).catch((e) => setError(e.message))
  usePoll(load, 10000, [])

  const run = async (fn) => { setError(''); try { await fn(); await load() } catch (e) { setError(e.message) } }
  const addDoctor = (e) => { e.preventDefault(); run(async () => { await api('/hospital/doctors', { method: 'POST', body: { ...d, fee: Number(d.fee) } }); setD({ name: '', specialization: '', fee: 1500 }) }) }
  const addSession = (e) => { e.preventDefault(); run(() => api('/hospital/sessions', { method: 'POST', body: { ...s, maxTokens: Number(s.maxTokens) } })) }
  const toggle = async (id) => { if (open === id) return setOpen(null); setOpen(id); setPatients(null); try { setPatients((await api(`/hospital/sessions/${id}/patients`)).patients) } catch (e) { setError(e.message) } }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-teal-700">Doctors & sessions</h2>
      <ErrorNote>{error}</ErrorNote>
      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={addDoctor} className="card space-y-3">
          <h3 className="font-bold">Add a doctor</h3>
          <div><label className="label" htmlFor="dn">Name</label><input id="dn" required className="input" placeholder="Dr. Nimali Perera" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="ds">Specialization</label><input id="ds" required list="specs" className="input" placeholder="Cardiology" value={d.specialization} onChange={(e) => setD({ ...d, specialization: e.target.value })} />
            <datalist id="specs">{['Cardiology', 'Pediatrics', 'General Medicine', 'Dermatology', 'Orthopedics', 'ENT'].map((x) => <option key={x} value={x} />)}</datalist></div>
          <div><label className="label" htmlFor="df">Consultation fee (LKR)</label><input id="df" type="number" min="0" required className="input" value={d.fee} onChange={(e) => setD({ ...d, fee: e.target.value })} /></div>
          <button className="btn-teal w-full">Save doctor</button>
        </form>
        <form onSubmit={addSession} className="card space-y-3">
          <h3 className="font-bold">Schedule a session</h3>
          <div><label className="label" htmlFor="sd">Doctor</label>
            <select id="sd" required className="input" value={s.doctorId} onChange={(e) => setS({ ...s, doctorId: e.target.value })}><option value="">Choose a doctor</option>{doctors.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.specialization})</option>)}</select></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1"><label className="label" htmlFor="dt">Date</label><input id="dt" type="date" min={todayISO()} required className="input px-2" value={s.date} onChange={(e) => setS({ ...s, date: e.target.value })} /></div>
            <div><label className="label" htmlFor="tm">Arrives</label><input id="tm" type="time" required className="input px-2" value={s.startTime} onChange={(e) => setS({ ...s, startTime: e.target.value })} /></div>
            <div><label className="label" htmlFor="mx">Max tokens</label><input id="mx" type="number" min="1" max="200" required className="input px-2" value={s.maxTokens} onChange={(e) => setS({ ...s, maxTokens: e.target.value })} /></div>
          </div>
          <button className="btn-confirm w-full" disabled={!doctors.length}>Publish session</button>
          {!doctors.length && <p className="text-xs text-slate-500">Add a doctor first.</p>}
        </form>
      </div>

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
