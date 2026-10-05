import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAlerts, usePoll } from '../hooks'
import PaymentModal from '../components/PaymentModal.jsx'
import Ticket from '../components/Ticket.jsx'
import { Empty, ErrorNote } from '../components/ui.jsx'

export default function Appointments() {
  const [list, setList] = useState(null); const [error, setError] = useState(''); const [paying, setPaying] = useState(null)
  const load = () => api('/appointments/mine').then(setList).catch((e) => setError(e.message))
  usePoll(load, 5000, [])
  const { perm, enable } = useAlerts(list || [])

  const cancel = async (a) => {
    if (!window.confirm(a.paymentStatus === 'PAID' ? 'Cancel this booking? Your payment will be queued for a refund.' : 'Cancel this booking?')) return
    try { await api(`/appointments/${a.id}`, { method: 'DELETE' }); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-bold text-teal-700">My tickets</h2><p className="text-sm text-slate-600">Your place in line updates every few seconds. No need to sit in the waiting room.</p></div>
        {perm === 'default' && <button className="btn-teal" onClick={enable}>Alert me when it's close</button>}
        {perm === 'granted' && <span className="text-sm font-semibold text-emerald-700">Alerts on</span>}
        {perm === 'denied' && <span className="text-sm text-slate-500">Alerts are blocked in your browser settings.</span>}
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!list ? <Empty>Loading your tickets…</Empty> : list.length === 0 ? (
        <div className="card text-center"><p className="text-slate-600">No tickets yet.</p><Link to="/book" className="btn-confirm mt-3">Book a doctor</Link></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">{list.map((t) => <Ticket key={t.appointment.id} t={t} onPay={setPaying} onCancel={cancel} />)}</div>
      )}
      {paying && <PaymentModal appointment={paying} onClose={() => { setPaying(null); load() }} onPaid={() => { setPaying(null); load() }} />}
    </div>
  )
}
