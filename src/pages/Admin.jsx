import { useRef, useState } from 'react'
import { api } from '../api'
import { useCountUp, usePoll } from '../hooks'
import { fileToDataUrl, getHospitalImage, removeHospitalImage, setHospitalImage } from '../lib/images'
import { provinceOf } from '../lib/provinces'
import { money } from '../fmt'
import { HospitalArt } from '../components/HospitalCard.jsx'
import { Avatar, Empty, ErrorNote, Modal, Pill, payTone, Skeleton } from '../components/ui.jsx'

const ROLE_FILTERS = [['ALL', 'All'], ['HOSPITAL', 'Hospital'], ['ADMIN', 'Admin'], ['PATIENT', 'Patient'], ['PHARMACY', 'Pharmacy']]
const TABS = ['Overview', 'Hospitals', 'Pharmacies', 'Users', 'Payments']
const PATHS = { Overview: '/admin/stats', Hospitals: '/admin/hospitals', Pharmacies: '/admin/pharmacies', Users: '/admin/users', Payments: '/admin/payments' }
const Pencil = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>

function Tile({ label, value, format = (n) => n, icon }) {
  const n = useCountUp(value)
  return (
    <div className="card group hover:-translate-y-1 hover:shadow-lift">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-lg text-teal-700 transition group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white" aria-hidden="true">{icon}</span>
      <p className="mt-3 text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold tabular-nums text-teal-700">{format(n)}</p>
    </div>
  )
}

function Overview({ s }) {
  const [tip, setTip] = useState(null)
  if (!s) return <div className="grid gap-4 sm:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
  const days = Object.entries(s.revenueByDay), max = Math.max(1, ...days.map(([, v]) => v))
  const methods = Object.entries(s.byMethod), total = methods.reduce((a, [, v]) => a + v, 0) || 1, tone = ['bg-teal-600', 'bg-emerald-600', 'bg-slate-500']
  return (
    <div className="space-y-4">
      <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Patients" value={s.patients} icon="👥" /><Tile label="Hospitals" value={s.hospitals} icon="🏥" /><Tile label="Pharmacies" value={s.pharmacies} icon="💊" /><Tile label="Revenue" value={s.revenue} format={money} icon="₨" />
      </div>
      <div className="card">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Paid revenue, last 7 days</h3><span className="text-sm font-semibold text-teal-700">{tip ? `${tip[0]}: ${money(tip[1])}` : 'Hover a bar'}</span></div>
        <div className="flex h-44 items-end gap-2">
          {days.map(([d, v]) => (
            <button key={d} type="button" onMouseEnter={() => setTip([d, v])} onFocus={() => setTip([d, v])} onMouseLeave={() => setTip(null)} onBlur={() => setTip(null)} aria-label={`${d}: ${money(v)}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1 focus:outline-none">
              <div className="w-full rounded-t-lg bg-teal-600 transition-all duration-700 group-hover:bg-teal-500 group-focus-visible:ring-2 group-focus-visible:ring-teal-600" style={{ height: `${Math.max(2, (v / max) * 100)}%` }} />
              <span className="text-[10px] text-slate-500">{d.slice(5)}</span>
            </button>))}
        </div>
      </div>
      <div className="card">
        <h3 className="mb-3 font-bold">How patients pay</h3>
        {methods.length === 0 ? <p className="text-sm text-slate-500">No payments yet.</p> : (<>
          <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">{methods.map(([m, v], i) => <div key={m} style={{ width: `${(v / total) * 100}%` }} className={`${tone[i % 3]} transition-all duration-700`} />)}</div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">{methods.map(([m, v], i) => <li key={m}><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${tone[i % 3]}`} />{m.replace('_', ' ').toLowerCase()} · {v}</li>)}</ul></>)}
      </div>
    </div>
  )
}

/** Photo picker. Photos are saved in this browser only (the backend has no image field yet). */
function PhotoField({ name, value, onChange, setError }) {
  const ref = useRef(null)
  const pick = async (e) => { try { onChange(await fileToDataUrl(e.target.files[0])) } catch (x) { setError(x.message) } e.target.value = '' }
  return (
    <div>
      <p className="label">Hospital photo</p>
      <div className="h-36 overflow-hidden rounded-2xl border border-slate-200 bg-sage-100">{value ? <img src={value} alt="Preview" className="h-full w-full object-cover" /> : <HospitalArt name={name || 'New hospital'} />}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-teal px-4 py-1.5" onClick={() => ref.current?.click()}>{value ? 'Change photo' : 'Upload photo'}</button>
        {value && <button type="button" className="btn-outline px-4 py-1.5" onClick={() => onChange(null)}>Remove</button>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} aria-label="Upload hospital photo" />
      </div>
      <p className="mt-1 text-xs text-slate-500">Saved in this browser only. Without a photo, an illustration is shown.</p>
    </div>
  )
}

function EditModal({ kind, row, onClose, onDone, setError }) {
  const hospital = kind === 'hospital'
  const [photo, setPhoto] = useState(hospital ? getHospitalImage(row.id) : null)
  const [verified, setVerified] = useState(row.verified); const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true); setError('')
    try {
      if (verified !== row.verified) await api(`/admin/${hospital ? 'hospitals' : 'pharmacies'}/${row.id}/verified`, { method: 'PUT', body: { verified } })
      if (hospital) { if (photo) { if (!setHospitalImage(row.id, photo)) throw new Error('Not enough browser storage for that photo. Try a smaller image.') } else removeHospitalImage(row.id) }
      onDone()
    } catch (e) { setError(e.message); setBusy(false) }
  }
  return (
    <Modal onClose={onClose} label={`Edit ${row.name}`}>
      <h2 className="text-lg font-extrabold text-teal-700">Edit {kind}</h2>
      <div className="mt-3 space-y-4">
        <div className="rounded-xl bg-sage-50 p-3 text-sm"><p className="font-bold">{row.name}</p><p className="text-slate-600">{row.address || row.city}</p>{hospital && <p className="mt-1 text-xs text-slate-500">{provinceOf(row)}</p>}</div>
        <p className="text-xs text-slate-500">Name and address can't be edited yet: that needs a backend update.</p>
        {hospital && <PhotoField name={row.name} value={photo} onChange={setPhoto} setError={setError} />}
        <button type="button" role="switch" aria-checked={verified} onClick={() => setVerified(!verified)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left">
          <span><span className="block text-sm font-bold">Visible to patients</span><span className="block text-xs text-slate-500">{verified ? 'Verified and bookable' : 'Hidden until verified'}</span></span>
          <span className={`relative h-6 w-11 rounded-full transition-colors ${verified ? 'bg-teal-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${verified ? 'left-[22px]' : 'left-0.5'}`} /></span>
        </button>
        <div className="flex gap-2"><button className="btn-confirm flex-1" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button><button className="btn-outline" onClick={onClose}>Cancel</button></div>
      </div>
    </Modal>
  )
}

function Orgs({ kind, rows, reload, setError }) {
  const hospital = kind === 'hospital'
  const blank = { name: '', city: '', address: '', staffName: '', staffEmail: '', staffPassword: '' }
  const [f, setF] = useState(blank); const [photo, setPhoto] = useState(null); const [edit, setEdit] = useState(null); const [open, setOpen] = useState(false)
  const path = hospital ? '/admin/hospitals' : '/admin/pharmacies'
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const onboard = async (e) => {
    e.preventDefault(); setError('')
    try {
      const created = await api(path, { method: 'POST', body: f })
      if (hospital && photo && created?.id) setHospitalImage(created.id, photo)
      setF(blank); setPhoto(null); setOpen(false); reload()
    } catch (x) { setError(x.message) }
  }
  const verify = async (r) => { try { await api(`${path}/${r.id}/verified`, { method: 'PUT', body: { verified: !r.verified } }); reload() } catch (x) { setError(x.message) } }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-bold">{hospital ? 'Hospitals' : 'Pharmacies'}{rows ? ` (${rows.length})` : ''}</h3><button className="btn-confirm px-5 py-2" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close form' : `+ Onboard ${kind}`}</button></div>
      {open && (
        <form onSubmit={onboard} className="card grid animate-fade-up gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="on">Name</label><input id="on" required className="input" value={f.name} onChange={set('name')} /></div>
          <div><label className="label" htmlFor="oc">{hospital ? 'City' : 'Phone'}</label><input id="oc" className="input" value={f.city} onChange={set('city')} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="oa">Address</label><input id="oa" className="input" value={f.address} onChange={set('address')} /></div>
          {hospital && <div className="sm:col-span-2"><PhotoField name={f.name} value={photo} onChange={setPhoto} setError={setError} /></div>}
          <div><label className="label" htmlFor="os">Staff name</label><input id="os" required className="input" value={f.staffName} onChange={set('staffName')} /></div>
          <div><label className="label" htmlFor="oe">Staff email</label><input id="oe" type="email" required className="input" value={f.staffEmail} onChange={set('staffEmail')} /></div>
          <div><label className="label" htmlFor="op">Temporary password</label><input id="op" type="password" minLength={6} required className="input" value={f.staffPassword} onChange={set('staffPassword')} /></div>
          <div className="flex items-end"><button className="btn-confirm w-full">Create {kind} and staff login</button></div>
        </form>)}
      {!rows ? <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div> : rows.length === 0 ? <Empty>Nothing here yet.</Empty> : (
        <div className="stagger grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="card overflow-hidden p-0 hover:-translate-y-1 hover:shadow-lift">
              {hospital && <div className="h-28 overflow-hidden bg-sage-100">{getHospitalImage(r.id) ? <img src={getHospitalImage(r.id)} alt="" className="h-full w-full object-cover" /> : <HospitalArt name={r.name} />}</div>}
              <div className="space-y-3 p-4">
                <div><p className="font-bold">{r.name}</p><p className="text-sm text-slate-500">{r.address || r.city}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={r.verified ? 'green' : 'red'}>{r.verified ? 'Verified' : 'Hidden from patients'}</Pill>{hospital && <Pill tone="teal">{provinceOf(r).replace(' Province', '')}</Pill>}
                  <span className="ml-auto flex gap-2"><button className="btn-outline flex items-center gap-1.5 px-3 py-1.5" onClick={() => setEdit(r)}><Pencil />Edit</button>
                    <button className={r.verified ? 'btn-outline px-3 py-1.5' : 'btn-confirm px-3 py-1.5'} onClick={() => verify(r)}>{r.verified ? 'Suspend' : 'Verify'}</button></span>
                </div>
              </div>
            </div>))}
        </div>)}
      {edit && <EditModal kind={kind} row={edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); reload() }} setError={setError} />}
    </div>
  )
}

function Users({ rows, reload, setError }) {
  const [filter, setFilter] = useState('ALL'); const [edit, setEdit] = useState(null); const [role, setRole] = useState('PATIENT'); const [busy, setBusy] = useState(false)
  const open = (u) => { setEdit(u); setRole(u.role) }
  const save = async () => { setBusy(true); try { await api(`/admin/users/${edit.id}/role`, { method: 'PUT', body: { role } }); setEdit(null); reload() } catch (e) { setError(e.message) } finally { setBusy(false) } }
  if (!rows) return <Skeleton className="h-64" />
  const count = (k) => (k === 'ALL' ? rows.length : rows.filter((u) => u.role === k).length)
  const shown = filter === 'ALL' ? rows : rows.filter((u) => u.role === filter)
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter users by role">
        {ROLE_FILTERS.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === k ? 'border-teal-600 bg-teal-600 text-white shadow' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>
            {label}<span className={`rounded-full px-2 text-xs ${filter === k ? 'bg-white/25' : 'bg-slate-100 text-slate-600'}`}>{count(k)}</span>
          </button>))}
      </div>
      {shown.length === 0 ? <Empty>No {ROLE_FILTERS.find(([k]) => k === filter)[1].toLowerCase()} users yet.</Empty> : (
      <ul className="card divide-y divide-slate-100 p-0">
        {shown.map((u) => (
          <li key={u.id} className="flex items-center gap-3 px-5 py-3 text-sm">
            <Avatar name={u.name} className="h-10 w-10 text-xs" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.name}</p><p className="truncate text-slate-500">{u.email}</p></div>
            <Pill tone="teal">{u.role.toLowerCase()}</Pill><button className="btn-outline flex items-center gap-1.5 px-3 py-1.5" onClick={() => open(u)}><Pencil />Edit</button>
          </li>))}
      </ul>)}
      {edit && (
        <Modal onClose={() => setEdit(null)} label={`Edit ${edit.name}`}>
          <h2 className="text-lg font-extrabold text-teal-700">Edit user</h2>
          <div className="mt-3 space-y-4"><div className="flex items-center gap-3 rounded-xl bg-sage-50 p-3"><Avatar name={edit.name} /><div><p className="font-bold">{edit.name}</p><p className="text-sm text-slate-500">{edit.email}</p></div></div>
            <div><label className="label" htmlFor="er">Role</label><select id="er" className="input" value={role} onChange={(e) => setRole(e.target.value)}>{['PATIENT', 'HOSPITAL', 'PHARMACY', 'ADMIN'].map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="flex gap-2"><button className="btn-confirm flex-1" disabled={busy || role === edit.role} onClick={save}>{busy ? 'Saving…' : 'Save role'}</button><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button></div></div>
        </Modal>)}
    </>
  )
}

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`
const Rs = ({ v }) => <>{rs(useCountUp(v))}</>
const METHODS = [['COUNTER', 'Pay at counter'], ['APPLE_PAY', 'Apple Pay'], ['CARD', 'Card']]
const TILE_ORDER = ['APPLE_PAY', 'COUNTER', 'CARD']
const sumOf = (list) => list.reduce((n, p) => n + p.amount, 0)

function Payments({ rows }) {
  const [filter, setFilter] = useState('ALL')
  if (!rows) return <Skeleton className="h-64" />
  if (rows.length === 0) return <Empty>No payments yet.</Empty>
  const of = (m) => rows.filter((p) => p.method === m)
  const stats = Object.fromEntries(METHODS.map(([m]) => {
    const all = of(m)
    return [m, { collected: sumOf(all.filter((p) => p.status === 'PAID')), pending: sumOf(all.filter((p) => p.status === 'PAY_AT_COUNTER')), patients: new Set(all.map((p) => p.patientId)).size, count: all.length }]
  }))
  const refunds = rows.filter((p) => p.status === 'REFUND_PENDING'), refundTotal = sumOf(refunds)
  const maxPaid = Math.max(1, ...METHODS.map(([m]) => stats[m].collected))
  const label = Object.fromEntries(METHODS)
  const filters = [['ALL', 'All'], ...METHODS, ['REFUND', 'Refunds']]
  const shown = filter === 'ALL' ? rows : filter === 'REFUND' ? refunds : of(filter)
  return (
    <div className="space-y-5">
      <section className="card space-y-4">
        <h3 className="font-bold">Money by payment method</h3>
        {METHODS.map(([m, name]) => (
          <div key={m}>
            <div className="flex items-baseline justify-between gap-3"><p className="font-semibold">{name}</p><p className="text-lg font-extrabold tabular-nums text-teal-700"><Rs v={stats[m].collected} /></p></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-teal-600 transition-all duration-700" style={{ width: `${(stats[m].collected / maxPaid) * 100}%` }} /></div>
            {m === 'COUNTER' && stats[m].pending > 0 && <p className="mt-1 text-xs text-slate-500">{rs(stats[m].pending)} still to be collected at the counter</p>}
          </div>))}
        <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3"><p className="font-semibold text-red-700">Refund</p><p className="text-lg font-extrabold tabular-nums text-red-700"><Rs v={refundTotal} /></p></div>
        <p className="text-xs text-slate-500">{refunds.length} {refunds.length === 1 ? 'booking is' : 'bookings are'} waiting for a refund. Totals cover the latest {rows.length} payments{rows.length >= 100 ? ' (the most the log returns)' : ''}.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {TILE_ORDER.map((m) => (
          <div key={m} className="card hover:-translate-y-1 hover:shadow-lift">
            <p className="font-semibold text-slate-600">{label[m]}</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums text-teal-700"><Count v={stats[m].patients} /></p>
            <p className="text-sm text-slate-500">patients who use this method</p>
            <p className="mt-1 text-xs text-slate-500">{stats[m].count} {stats[m].count === 1 ? 'payment' : 'payments'}</p>
          </div>))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter payments">
          {filters.map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === k ? 'border-teal-600 bg-teal-600 text-white shadow' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>{l}</button>)}
        </div>
        {shown.length === 0 ? <Empty>No payments in this category.</Empty> : (
          <ul className="card divide-y divide-slate-100 p-0">
            {shown.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <div><p className="font-semibold">{p.patientName} · {rs(p.amount)}</p><p className="text-slate-500">{p.hospitalName} · {label[p.method] || p.method}{p.cardLast4 ? ` ····${p.cardLast4}` : ''} · {p.reference}</p></div>
                <Pill tone={payTone[p.status]}>{p.status.replace('_', ' ').toLowerCase()}</Pill>
              </li>))}
          </ul>)}
      </section>
    </div>
  )
}
const Count = ({ v }) => <>{useCountUp(v)}</>

export default function Admin() {
  const [tab, setTab] = useState('Overview'); const [error, setError] = useState(''); const [data, setData] = useState({})
  const load = () => api(PATHS[tab]).then((r) => setData((d) => ({ ...d, [tab]: r }))).catch((e) => setError(e.message))
  usePoll(load, 10000, [tab])
  const rows = data[tab]
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lift">
        <p className="text-sm font-semibold text-teal-50">Admin</p><h1 className="text-3xl font-extrabold">Management console</h1><p className="text-sm text-teal-50">Onboard hospitals and pharmacies, manage people, and watch payments.</p>
      </section>
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-slate-200" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setError('') }} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-teal-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>{t}</button>)}
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div key={tab} className="animate-fade-up">
        {tab === 'Overview' && <Overview s={rows} />}
        {tab === 'Hospitals' && <Orgs kind="hospital" rows={rows} reload={load} setError={setError} />}
        {tab === 'Pharmacies' && <Orgs kind="pharmacy" rows={rows} reload={load} setError={setError} />}
        {tab === 'Users' && <Users rows={rows} reload={load} setError={setError} />}
        {tab === 'Payments' && <Payments rows={rows} />}
      </div>
    </div>
  )
}