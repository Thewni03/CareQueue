import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { Empty, ErrorNote } from '../components/ui.jsx'

const TRY = ['Panadol', 'paracetmol', 'insulin', 'ventolin', 'augmentin']

export default function Medicine() {
  const [q, setQ] = useState(''); const [res, setRes] = useState(null)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState(null); const seq = useRef(0)

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

  const locate = () => navigator.geolocation?.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setError('Location is off. Turn it on in your browser to sort by distance.'))

  return (
    <div className="space-y-4">
      <div><h2 className="text-lg font-bold text-teal-700">Find medicine in stock</h2>
        <p className="text-sm text-slate-600">Type a brand, a generic name, or your best spelling. We check nearby pharmacies.</p></div>
      <div className="card space-y-3">
        <input className="input" placeholder="e.g. Panadol, paracetmol, insulin" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Medicine name" />
        <div className="flex flex-wrap items-center gap-2">
          {TRY.map((t) => <button key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700" onClick={() => setQ(t)}>{t}</button>)}
          <button className="btn-teal ml-auto px-3 py-1.5" onClick={locate}>{pos ? 'Sorted by distance' : 'Use my location'}</button>
        </div>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {busy && <p className="text-sm text-slate-500">Checking pharmacies…</p>}
      {res && !busy && (
        <div className="space-y-3">
          {res.interpretedAs.length > 0 && <p className="text-sm text-slate-600">We also searched for: {res.interpretedAs.join(', ')}</p>}
          {res.results.length === 0 ? <Empty>No pharmacy has "{res.query}" in stock. Try another spelling or the generic name.</Empty> :
            res.results.map((r, idx) => (
              <section key={r.pharmacy.id} className="card">
                <div className="flex justify-between gap-3">
                  <div><h3 className="font-bold">{r.pharmacy.name}{idx === 0 && r.distanceKm != null && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Closest</span>}</h3><p className="text-sm text-slate-600">{r.pharmacy.address}</p></div>
                  {r.distanceKm != null && <p className="whitespace-nowrap text-sm font-semibold text-teal-700">{r.distanceKm} km</p>}
                </div>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {r.matches.map((m, i) => <li key={i} className="flex justify-between py-1.5"><span>{m.brandName} <span className="text-slate-500">({m.genericName})</span></span><span className="font-semibold text-emerald-700">{m.quantity < 10 ? `Only ${m.quantity} left` : 'In stock'}</span></li>)}
                </ul>
                {r.pharmacy.phone && <a className="btn-outline mt-3" href={`tel:${r.pharmacy.phone}`}>Call pharmacy</a>}
              </section>))}
        </div>
      )}
    </div>
  )
}
