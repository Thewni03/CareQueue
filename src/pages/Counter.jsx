import { useState } from 'react'
import { api } from '../api'
import { usePoll } from '../hooks'
import { dayLabel, payLabel, time12 } from '../fmt'
import { Empty, ErrorNote, Pill, payTone } from '../components/ui.jsx'

export default function Counter() {
  const [sessions, setSessions] = useState(null); const [sel, setSel] = useState(null)
  const [detail, setDetail] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  usePoll(() => api('/hospital/sessions').then((l) => { setSessions(l); setSel((c) => c || l.find((s) => s.date === l[0]?.date)?.id || null) }).catch((e) => setError(e.message)), 15000, [])
  usePoll(() => sel && api(`/hospital/sessions/${sel}/patients`).then(setDetail).catch((e) => setError(e.message)), 4000, [sel])

  const next = async () => {
    setBusy(true); setError('')
    try { setDetail(await api('/queue/increment', { method: 'POST', body: { sessionId: sel } })) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const collect = async (id) => {
    try { await api(`/hospital/appointments/${id}/collect`, { method: 'POST' }); setDetail(await api(`/hospital/sessions/${sel}/patients`)) } catch (e) { setError(e.message) }
  }
  const s = detail?.session

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-teal-700">Live counter</h2>
      <ErrorNote>{error}</ErrorNote>
      {!sessions ? <Empty>Loading sessions…</Empty> : sessions.length === 0 ? <Empty>No sessions scheduled. Add one under Doctors & sessions.</Empty> : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sessions.map((x) => (
            <button key={x.id} onClick={() => { setSel(x.id); setDetail(null) }} className={`shrink-0 rounded-xl border px-4 py-2 text-left text-sm ${sel === x.id ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>
              <p className="font-semibold">{x.doctorName}</p><p className={sel === x.id ? 'text-teal-100' : 'text-slate-500'}>{dayLabel(x.date)}, {time12(x.startTime)}</p>
            </button>))}
        </div>
      )}
      {s && (
        <>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Now serving</p>
            <p className="text-8xl font-extrabold leading-tight text-slate-800 tabular-nums">{s.nowServing || '–'}</p>
            <p className="text-sm text-slate-600">{detail.waiting} waiting · {s.lastIssued} of {s.maxTokens} tokens issued · avg {s.avgMinutesPerPatient} min</p>
          </div>
          <button className="btn-staff w-full py-8 text-2xl" onClick={next} disabled={busy || detail.waiting <= 0}>{detail.waiting <= 0 ? 'No patients waiting' : 'Next token'}</button>
          <ul className="card divide-y divide-slate-100 p-0">
            {detail.patients.length === 0 && <li className="px-5 py-6 text-center text-sm text-slate-500">No bookings yet.</li>}
            {detail.patients.map((p) => (
              <li key={p.appointmentId} className={`flex items-center justify-between gap-3 px-5 py-3 text-sm ${p.tokenNumber === s.nowServing ? 'bg-teal-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full font-bold tabular-nums ${p.status === 'SERVED' ? 'bg-slate-200 text-slate-500' : p.tokenNumber === s.nowServing ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>{p.tokenNumber}</span>
                  <div><p className="font-semibold">{p.patientName}</p><p className="text-xs text-slate-500">{p.status === 'SERVED' ? 'Seen' : p.status === 'HELD' ? 'Payment pending' : p.tokenNumber === s.nowServing ? 'In consultation' : 'Waiting'}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={payTone[p.paymentStatus]}>{payLabel[p.paymentStatus]}</Pill>
                  {p.paymentStatus === 'PAY_AT_COUNTER' && <button className="btn-confirm px-3 py-1.5" onClick={() => collect(p.appointmentId)}>Cash received</button>}
                </div>
              </li>))}
          </ul>
        </>
      )}
    </div>
  )
}
