import { useState } from 'react'
import { api } from '../api'
import { usePoll } from '../hooks'
import { Empty, ErrorNote, Pill } from '../components/ui.jsx'

export default function PharmacyStock() {
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [filter, setFilter] = useState('')
  const [f, setF] = useState({ brandName: '', genericName: '', quantity: 10 })
  const load = () => api('/pharmacies/stock').then(setItems).catch((e) => setError(e.message))
  usePoll(load, 15000, [])

  const save = async (body) => { setError(''); try { await api('/pharmacies/stock', { method: 'PUT', body }); await load() } catch (e) { setError(e.message) } }
  const set = (i, q) => save({ brandName: i.brandName, genericName: i.genericName, quantity: Math.max(0, q) })
  const add = async (e) => { e.preventDefault(); await save({ ...f, quantity: Number(f.quantity) }); setF({ brandName: '', genericName: '', quantity: 10 }) }
  const remove = async (id) => { try { await api(`/pharmacies/stock/${id}`, { method: 'DELETE' }); await load() } catch (e) { setError(e.message) } }
  const shown = (items || []).filter((i) => (i.brandName + i.genericName).toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-teal-700">Your stock</h2>
      <ErrorNote>{error}</ErrorNote>
      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-4">
        <div><label className="label" htmlFor="b">Brand name</label><input id="b" required className="input" value={f.brandName} onChange={(e) => setF({ ...f, brandName: e.target.value })} /></div>
        <div><label className="label" htmlFor="g">Generic name</label><input id="g" required className="input" value={f.genericName} onChange={(e) => setF({ ...f, genericName: e.target.value })} /></div>
        <div><label className="label" htmlFor="q">Quantity</label><input id="q" type="number" min="0" required className="input" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></div>
        <div className="flex items-end"><button className="btn-confirm w-full">Add medicine</button></div>
      </form>
      <input className="input" placeholder="Search your stock" aria-label="Search your stock" value={filter} onChange={(e) => setFilter(e.target.value)} />
      {!items ? <Empty>Loading stock…</Empty> : shown.length === 0 ? <Empty>{items.length ? 'Nothing matches that search.' : 'No items yet. Add your first medicine above.'}</Empty> : (
        <ul className="card divide-y divide-slate-100 p-0">
          {shown.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><p className="font-semibold">{i.brandName}</p><p className="text-slate-500">{i.genericName}</p></div>
              <div className="flex items-center gap-2">
                <Pill tone={i.quantity > 0 ? 'green' : 'red'}>{i.quantity > 0 ? 'In stock' : 'Out of stock'}</Pill>
                <button aria-label={`Decrease ${i.brandName}`} className="btn-outline px-3 py-1.5" onClick={() => set(i, i.quantity - 1)}>−</button>
                <span className="w-10 text-center font-bold tabular-nums">{i.quantity}</span>
                <button aria-label={`Increase ${i.brandName}`} className="btn-outline px-3 py-1.5" onClick={() => set(i, i.quantity + 1)}>+</button>
                {i.quantity > 0 ? <button className="btn-danger px-3 py-1.5" onClick={() => set(i, 0)}>Mark out</button> : <button className="btn-teal px-3 py-1.5" onClick={() => set(i, 20)}>Restock 20</button>}
                <button className="text-xs font-semibold text-slate-500 hover:text-red-600" onClick={() => remove(i.id)}>Remove</button>
              </div>
            </li>))}
        </ul>
      )}
    </div>
  )
}
