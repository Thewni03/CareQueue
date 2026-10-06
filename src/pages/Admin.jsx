import { useState } from 'react'
import { api } from '../api'
import { usePoll } from '../hooks'
import { money } from '../fmt'
import { Empty, ErrorNote, Pill, payTone } from '../components/ui.jsx'

const TABS = ['Overview', 'Hospitals', 'Pharmacies', 'Users', 'Payments']

function Overview({ s }) {
  if (!s) return <Empty>Loading…</Empty>
  const days = Object.entries(s.revenueByDay), max = Math.max(1, ...days.map(([, v]) => v))
  const methods = Object.entries(s.byMethod), total = methods.reduce((a, [, v]) => a + v, 0) || 1
  const tiles = [['Patients', s.patients], ['Hospitals', s.hospitals], ['Pharmacies', s.pharmacies], ['Revenue', money(s.revenue)]]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([l, v]) => <div key={l} className="card"><p className="text-sm text-slate-600">{l}</p><p className="text-2xl font-extrabold tabular-nums text-teal-700">{v}</p></div>)}</div>
      <div className="card">
        <h3 className="mb-3 font-bold">Paid revenue, last 7 days</h3>
        <div className="flex h-40 items-end gap-2">
          {days.map(([d, v]) => (
            <div key={d} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d}: ${money(v)}`}>
              <span className="text-[10px] font-semibold tabular-nums text-slate-500">{v ? Math.round(v / 100) / 10 + 'k' : ''}</span>
              <div className="w-full rounded-t bg-teal-600 transition-all" style={{ height: `${Math.max(2, (v / max) * 100)}%` }} />
              <span className="text-[10px] text-slate-500">{d.slice(5)}</span>
            </div>))}
        </div>
      </div>
      <div className="card">
        <h3 className="mb-3 font-bold">How patients pay</h3>
        {methods.length === 0 ? <p className="text-sm text-slate-500">No payments yet.</p> : (
          <>
            <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
              {methods.map(([m, v], i) => <div key={m} style={{ width: `${(v / total) * 100}%` }} className={['bg-teal-600', 'bg-emerald-600', 'bg-slate-500'][i % 3]} />)}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              {methods.map(([m, v], i) => <li key={m}><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${['bg-teal-600', 'bg-emerald-600', 'bg-slate-500'][i % 3]}`} />{m.replace('_', ' ').toLowerCase()} · {v}</li>)}
            </ul>
          </>)}
      </div>
    </div>
  )
}

function Orgs({ kind, rows, reload, setError }) {
  const [f, setF] = useState({ name: '', city: '', address: '', staffName: '', staffEmail: '', staffPassword: '' })
  const path = kind === 'hospital' ? '/admin/hospitals' : '/admin/pharmacies'
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const onboard = async (e) => { e.preventDefault(); setError(''); try { await api(path, { method: 'POST', body: f }); setF({ name: '', city: '', address: '', staffName: '', staffEmail: '', staffPassword: '' }); reload() } catch (x) { setError(x.message) } }
  const verify = async (r) => { try { await api(`${path}/${r.id}/verified`, { method: 'PUT', body: { verified: !r.verified } }); reload() } catch (x) { setError(x.message) } }
  return (
    <div className="space-y-4">
      <form onSubmit={onboard} className="card grid gap-3 sm:grid-cols-2">
        <h3 className="font-bold sm:col-span-2">Onboard a {kind}</h3>
        <div><label className="label">Name</label><input required className="input" value={f.name} onChange={set('name')} /></div>
        <div><label className="label">{kind === 'hospital' ? 'City' : 'Phone'}</label><input className="input" value={f.city} onChange={set('city')} /></div>
        <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={f.address} onChange={set('address')} /></div>
        <div><label className="label">Staff name</label><input required className="input" value={f.staffName} onChange={set('staffName')} /></div>
        <div><label className="label">Staff email</label><input type="email" required className="input" value={f.staffEmail} onChange={set('staffEmail')} /></div>
        <div><label className="label">Temporary password</label><input type="password" minLength={6} required className="input" value={f.staffPassword} onChange={set('staffPassword')} /></div>
        <div className="flex items-end"><button className="btn-confirm w-full">Create {kind} and staff login</button></div>
      </form>
      {!rows ? <Empty>Loading…</Empty> : (
        <ul className="card divide-y divide-slate-100 p-0">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><p className="font-semibold">{r.name}</p><p className="text-slate-500">{r.address || r.city}</p></div>
              <div className="flex items-center gap-3"><Pill tone={r.verified ? 'green' : 'red'}>{r.verified ? 'Verified' : 'Hidden from patients'}</Pill>
                <button className={r.verified ? 'btn-outline px-3 py-1.5' : 'btn-confirm px-3 py-1.5'} onClick={() => verify(r)}>{r.verified ? 'Suspend' : 'Verify'}</button></div>
            </li>))}
        </ul>)}
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('Overview'); const [error, setError] = useState('')
  const [data, setData] = useState({})
  const load = () => {
    const map = { Overview: '/admin/stats', Hospitals: '/admin/hospitals', Pharmacies: '/admin/pharmacies', Users: '/admin/users', Payments: '/admin/payments' }
    api(map[tab]).then((r) => setData((d) => ({ ...d, [tab]: r }))).catch((e) => setError(e.message))
  }
  usePoll(load, 10000, [tab])
  const setRole = async (id, role) => { try { await api(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }); load() } catch (e) { setError(e.message) } }
  const rows = data[tab]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-teal-700">Management console</h2>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-200">
        {TABS.map((t) => <button key={t} onClick={() => { setTab(t); setError('') }} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t}</button>)}
      </div>
      <ErrorNote>{error}</ErrorNote>
      {tab === 'Overview' && <Overview s={rows} />}
      {tab === 'Hospitals' && <Orgs kind="hospital" rows={rows} reload={load} setError={setError} />}
      {tab === 'Pharmacies' && <Orgs kind="pharmacy" rows={rows} reload={load} setError={setError} />}
      {tab === 'Users' && (!rows ? <Empty>Loading…</Empty> : (
        <ul className="card divide-y divide-slate-100 p-0">
          {rows.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><p className="font-semibold">{u.name}</p><p className="text-slate-500">{u.email}</p></div>
              <select aria-label={`Role for ${u.name}`} className="input w-36" value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                {['PATIENT', 'HOSPITAL', 'PHARMACY', 'ADMIN'].map((r) => <option key={r}>{r}</option>)}</select>
            </li>))}
        </ul>))}
      {tab === 'Payments' && (!rows ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No payments yet.</Empty> : (
        <ul className="card divide-y divide-slate-100 p-0">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><p className="font-semibold">{p.patientName} · {money(p.amount)}</p><p className="text-slate-500">{p.hospitalName} · {p.method.replace('_', ' ').toLowerCase()}{p.cardLast4 ? ` ····${p.cardLast4}` : ''} · {p.reference}</p></div>
              <Pill tone={payTone[p.status]}>{p.status.replace('_', ' ').toLowerCase()}</Pill>
            </li>))}
        </ul>))}
    </div>
  )
}
