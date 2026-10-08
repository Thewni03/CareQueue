import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAlerts, usePoll } from '../hooks'
import PaymentModal from '../components/PaymentModal.jsx'
import Ticket from '../components/Ticket.jsx'
import { ErrorNote, Skeleton } from '../components/ui.jsx'

export default function Appointments() {
  const [list, setList] = useState(null); const [error, setError] = useState(''); const [paying, setPaying] = useState(null)
  const load = () => api('/appointments/mine').then(setList).catch((e) => setError(e.message))
  usePoll(load, 5000, [])
  const { perm, enable } = useAlerts(list || [])
  const active = (list || []).filter((t) => t.appointment.status === 'BOOKED' || t.appointment.status === 'HELD').length

  const cancel = async (a) => {
    if (!window.confirm(a.paymentStatus === 'PAID' ? 'Cancel this booking? Your payment will be queued for a refund.' : 'Cancel this booking?')) return
    try { await api(`/appointments/${a.id}`, { method: 'DELETE' }); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
        <div>
          <h2 className="text-lg font-bold text-teal-700">My tickets</h2>
          <p className="text-sm text-slate-600">{list ? (active ? `${active} active · updates every few seconds` : 'Nothing active right now') : 'Loading…'}. No need to sit in the waiting room.</p>
        </div>
        {perm === 'default' && <button className="btn-teal" onClick={enable}>Alert me when it's close</button>}
        {perm === 'granted' && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">Alerts on</span>}
        {perm === 'denied' && <span className="text-sm text-slate-500">Alerts are blocked in your browser settings.</span>}
      </section>
      <ErrorNote>{error}</ErrorNote>
      {!list ? <div className="grid gap-5 md:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div> : list.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <svg aria-hidden="true" viewBox="0 0 64 40" className="mb-4 h-16 w-24 animate-float text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"><path d="M4 8h56v8a4 4 0 0 0 0 8v8H4v-8a4 4 0 0 0 0-8z" /><path d="M42 8v24" strokeDasharray="3 4" /></svg>
          <p className="font-bold text-slate-700">No tickets yet</p><p className="mt-1 text-sm text-slate-500">Book a doctor and your live token appears here.</p>
          <Link to="/book" className="btn-confirm mt-5">Book a doctor</Link>
        </div>
      ) : <div className="grid gap-6 md:grid-cols-2">{list.map((t) => <Ticket key={t.appointment.id} t={t} onPay={setPaying} onCancel={cancel} />)}</div>}
      {paying && <PaymentModal appointment={paying} onClose={() => { setPaying(null); load() }} onPaid={() => { setPaying(null); load() }} />}
    </div>
  )
}