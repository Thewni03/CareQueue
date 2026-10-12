import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { Avatar, Empty, ErrorNote } from '../components/ui.jsx'

const TRY = ['Panadol', 'paracetmol', 'insulin', 'ventolin', 'augmentin']
const KEY = 'recent-medicine'
const loadRecent = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const latlng = (p) => {
  const l = p?.location; if (!l) return null
  const lat = l.coordinates?.[1] ?? l.y, lng = l.coordinates?.[0] ?? l.x
  return lat != null && lng != null ? { lat, lng } : null
}
const total = (r) => r.matches.reduce((n, m) => n + m.quantity, 0)

const SearchIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>

/** Decorative floating pill. */
const Capsule = ({ className }) => <span aria-hidden="true" className={`pointer-events-none absolute block h-6 w-14 animate-float rounded-full ${className}`} style={{ background: 'linear-gradient(90deg, rgba(255,255,255,.92) 50%, rgba(255,255,255,.35) 50%)' }} />

/** A capsule that rolls while we check the pharmacies. */
const Loader = () => <span aria-hidden="true" className="inline-block h-4 w-9 animate-[spin_1s_linear_infinite] rounded-full border-2 border-teal-600" style={{ background: 'linear-gradient(90deg, #0D9488 50%, #fff 50%)' }} />

const Gauge = ({ qty }) => {
  const low = qty < 10, pct = Math.max(6, Math.min(100, (qty / 50) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className={`h-full rounded-full transition-all duration-700 ${low ? 'bg-red-600' : 'bg-emerald-600'}`} style={{ width: `${pct}%` }} /></div>
      <span className={`whitespace-nowrap text-xs font-bold ${low ? 'text-red-700' : 'text-emerald-700'}`}>{low ? `Only ${qty} left` : 'In stock'}</span>
    </div>
  )
}

/** Live radar: you in the middle, each pharmacy as a dot. True bearings when location is on. */
function Radar({ rows, pos, active, setActive }) {
  const c = 180, R = 150
  const maxKm = Math.max(1, ...rows.map((r) => r.distanceKm || 0))
  const pts = rows.map((r, i) => {
    const ll = latlng(r.pharmacy); let ux, uy, rad
    if (pos && ll) {
      const a = Math.atan2(ll.lat - pos.lat, (ll.lng - pos.lng) * Math.cos((pos.lat * Math.PI) / 180))
      ux = Math.cos(a); uy = -Math.sin(a)
    } else { const a = (i * 2 * Math.PI) / rows.length - Math.PI / 2; ux = Math.cos(a); uy = Math.sin(a) }
    rad = r.distanceKm != null ? 28 + (r.distanceKm / maxKm) * (R - 40) : 60 + (i / Math.max(1, rows.length - 1)) * 80
    return { id: r.pharmacy.id, name: r.pharmacy.name, x: c + rad * ux, y: c + rad * uy }
  })
  return (
    <div className="card flex flex-col items-center">
      <svg viewBox="0 0 360 360" className="w-full max-w-sm" role="group" aria-label="Radar of pharmacies around you">
        {[R / 3, (2 * R) / 3, R].map((r) => <circle key={r} cx={c} cy={c} r={r} fill="none" strokeWidth="1.5" strokeDasharray="4 5" className="stroke-slate-200" />)}
        <line x1={c} y1={c - R} x2={c} y2={c + R} strokeWidth="1" className="stroke-slate-200" /><line x1={c - R} y1={c} x2={c + R} y2={c} strokeWidth="1" className="stroke-slate-200" />
        <g className="animate-[spin_6s_linear_infinite]" style={{ transformOrigin: `${c}px ${c}px` }}><line x1={c} y1={c} x2={c} y2={c - R} stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" opacity=".55" /></g>
        <circle cx={c} cy={c} r="10" fill="#0D9488" opacity=".25" className="animate-ping" style={{ transformOrigin: `${c}px ${c}px` }} /><circle cx={c} cy={c} r="6" fill="#0D9488" />
        <text x={c} y={c + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" className="text-slate-500">You</text>
        {pts.map((p) => {
          const on = active === p.id
          return (
            <g key={p.id} tabIndex={0} role="button" aria-label={`${p.name}${on ? ' (selected)' : ''}`} className="cursor-pointer outline-none" onClick={() => setActive(p.id)} onMouseEnter={() => setActive(p.id)} onFocus={() => setActive(p.id)}>
              <circle cx={p.x} cy={p.y} r={on ? 13 : 9} fill={on ? '#059669' : '#0D9488'} stroke="#fff" strokeWidth="2.5" style={{ transition: 'r .2s' }} />
              <text x={p.x} y={p.y - 17} textAnchor="middle" fontSize="11" fontWeight={on ? 800 : 600} fill="currentColor" className={on ? 'text-teal-700' : 'text-slate-600'}>{p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name}</text>
            </g>)
        })}
      </svg>
      <p className="text-center text-xs text-slate-500">{pos ? 'Dots show each pharmacy’s direction and distance from you.' : 'Turn on your location for true directions and distances.'} Tap a dot to highlight its card.</p>
    </div>
  )
}

export default function Medicine() {
  const [q, setQ] = useState(''); const [res, setRes] = useState(null)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState(null); const seq = useRef(0)
  const [sort, setSort] = useState('near'); const [hideLow, setHideLow] = useState(false); const [view, setView] = useState('list')
  const [active, setActive] = useState(null); const [recent, setRecent] = useState(loadRecent)

  useEffect(() => {
    if (q.trim().length < 3) { setRes(null); return }
    const my = ++seq.current
    const t = setTimeout(async () => {           // search as you type
      setBusy(true); setError('')
      try { const r = await api(`/pharmacies/search?${new URLSearchParams({ q, ...(pos || {}) })}`); if (my === seq.current) setRes(r) }
      catch (e) { setError(e.message) } finally { setBusy(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [q, pos])

  useEffect(() => {                              // remember searches that found something
    if (!res || !res.results.length) return
    const k = res.query.trim().toLowerCase()
    setRecent((old) => { const next = [k, ...old.filter((x) => x !== k)].slice(0, 5); try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {} ; return next })
  }, [res])

  const locate = () => navigator.geolocation?.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setSort('near') }, () => setError('Location is off. Turn it on in your browser to sort by distance.'))
  const clearRecent = () => { setRecent([]); try { localStorage.removeItem(KEY) } catch {} }

  const rows = useMemo(() => {
    if (!res) return []
    let r = res.results.map((x) => ({ ...x, matches: hideLow ? x.matches.filter((m) => m.quantity >= 10) : x.matches })).filter((x) => x.matches.length)
    r = [...r].sort(sort === 'stock' ? (a, b) => total(b) - total(a) : (a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
    return r
  }, [res, sort, hideLow])

  const chip = 'rounded-full px-3 py-1 text-xs font-semibold transition'
  const seg = (on) => `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${on ? 'bg-teal-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lift sm:p-8">
        <Capsule className="right-10 top-6 rotate-12" /><Capsule className="right-28 top-20 -rotate-12 [animation-delay:1.5s]" /><Capsule className="bottom-8 right-6 rotate-45 [animation-delay:3s]" />
        <p className="relative text-sm font-semibold text-teal-50">Find medicine in stock</p>
        <h1 className="relative mt-1 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">Which medicine do you need?</h1>
        <p className="relative mt-2 max-w-md text-sm text-teal-50">Type a brand, a generic name, or your best spelling. We check nearby pharmacies as you type.</p>
        <div className="relative mt-5 max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-700"><SearchIcon /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Medicine name" placeholder="e.g. Panadol, paracetmol, insulin"
            className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-24 text-base text-slate-800 shadow-lift focus:outline-none focus:ring-4 focus:ring-white/40" />
          <span className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {busy && <Loader />}
            {q && <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200">Clear</button>}
          </span>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-teal-50">Try:</span>
          {TRY.map((t) => <button key={t} type="button" onClick={() => setQ(t)} className={`${chip} bg-white/15 text-white hover:bg-white hover:text-teal-700`}>{t}</button>)}
        </div>
        {recent.length > 0 && (
          <div className="relative mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-teal-50">Recent:</span>
            {recent.map((t) => <button key={t} type="button" onClick={() => setQ(t)} className={`${chip} border border-white/40 text-white hover:bg-white hover:text-teal-700`}>{t}</button>)}
            <button type="button" onClick={clearRecent} className="text-xs font-semibold text-teal-50 underline underline-offset-2 hover:text-white">Clear</button>
          </div>)}
      </section>

      <ErrorNote>{error}</ErrorNote>

      {q.trim().length < 3 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[['Any spelling works', 'Brand names, generic names and common misspellings are matched for you.'], ['Turn on location', 'See the closest pharmacy first, and a live radar of what is around you.'], ['Call before you go', 'Stock changes during the day, so a quick call confirms it.']].map(([a, b]) => (
            <div key={a} className="card hover:-translate-y-1 hover:shadow-lift"><p className="font-bold text-teal-700">{a}</p><p className="mt-1 text-sm text-slate-600">{b}</p></div>))}
        </div>)}

      {res && (
        <>
          <div className="card flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
            <button type="button" onClick={locate} className={pos ? 'btn-confirm px-4 py-2' : 'btn-teal px-4 py-2'}>{pos ? 'Location on' : 'Use my location'}</button>
            <div className="flex items-center gap-1 rounded-full bg-slate-50 p-1" role="group" aria-label="Sort results">
              <button type="button" aria-pressed={sort === 'near'} className={seg(sort === 'near')} onClick={() => setSort('near')}>Nearest</button>
              <button type="button" aria-pressed={sort === 'stock'} className={seg(sort === 'stock')} onClick={() => setSort('stock')}>Most stock</button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={hideLow} onChange={(e) => setHideLow(e.target.checked)} className="h-4 w-4 accent-teal-600" />Hide low stock</label>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-slate-50 p-1" role="group" aria-label="Choose view">
              <button type="button" aria-pressed={view === 'list'} className={seg(view === 'list')} onClick={() => setView('list')}>List</button>
              <button type="button" aria-pressed={view === 'radar'} className={seg(view === 'radar')} onClick={() => setView('radar')}>Radar</button>
            </div>
          </div>

          <div role="status" aria-live="polite" className="space-y-1">
            <p className="text-lg font-bold text-teal-700">{rows.length === 0 ? 'No pharmacy has it in stock' : `${rows.length} ${rows.length === 1 ? 'pharmacy has' : 'pharmacies have'} it in stock`}</p>
            {res.interpretedAs.length > 0 && <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600">We also searched for {res.interpretedAs.map((t) => <span key={t} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{t}</span>)}</p>}
          </div>

          {rows.length === 0 ? <Empty>Nothing matches "{res.query}"{hideLow ? ' with the low-stock filter on' : ''}. Try another spelling or the generic name.</Empty> : (
            <div className={view === 'radar' ? 'grid items-start gap-4 md:grid-cols-2' : ''}>
              {view === 'radar' && <Radar rows={rows} pos={pos} active={active} setActive={setActive} />}
              <div className="stagger space-y-3">
                {rows.map((r, idx) => {
                  const ll = latlng(r.pharmacy), on = active === r.pharmacy.id
                  const dir = ll && `https://www.google.com/maps/dir/?api=1&destination=${ll.lat},${ll.lng}${pos ? `&origin=${pos.lat},${pos.lng}` : ''}`
                  return (
                    <section key={r.pharmacy.id} onMouseEnter={() => setActive(r.pharmacy.id)} className={`card hover:-translate-y-0.5 hover:shadow-lift ${on ? 'border-teal-600 ring-2 ring-teal-600/25' : ''}`}>
                      <div className="flex items-start gap-3">
                        <Avatar name={r.pharmacy.name} className="h-11 w-11 text-sm" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{r.pharmacy.name}{idx === 0 && r.distanceKm != null && sort === 'near' && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Closest</span>}</h3>
                          <p className="text-sm text-slate-600">{r.pharmacy.address}</p>
                        </div>
                        {r.distanceKm != null && <p className="whitespace-nowrap rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">{r.distanceKm} km</p>}
                      </div>
                      <ul className="mt-3 divide-y divide-slate-100 text-sm">
                        {r.matches.map((m, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="font-semibold">{m.brandName} <span className="font-normal text-slate-500">({m.genericName})</span></span><Gauge qty={m.quantity} /></li>)}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.pharmacy.phone && <a className="btn-outline px-4 py-2" href={`tel:${r.pharmacy.phone}`}>Call</a>}
                        {dir && <a className="btn-teal px-4 py-2" href={dir} target="_blank" rel="noopener noreferrer">Directions</a>}
                      </div>
                    </section>)
                })}
              </div>
            </div>)}
        </>)}
    </div>
  )
}