import { useState } from 'react'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Month grid. Today is filled teal; days with an appointment are circled in green. */
export default function Calendar({ marked = {}, selected, onSelect }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const today = iso(new Date())
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const move = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => move(-1)} className="rounded-full px-3 py-1 font-bold transition hover:bg-teal-600/10">‹</button>
          <button type="button" aria-label="Next month" onClick={() => move(1)} className="rounded-full px-3 py-1 font-bold transition hover:bg-teal-600/10">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-semibold text-slate-500">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((n, i) => {
          if (!n) return <span key={i} />
          const key = iso(new Date(cursor.getFullYear(), cursor.getMonth(), n))
          const isToday = key === today, has = !!marked[key], sel = key === selected
          return (
            <button key={i} type="button" onClick={() => onSelect?.(key)} aria-label={`${key}${isToday ? ', today' : ''}${has ? ', has an appointment' : ''}`} aria-pressed={sel}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full font-semibold tabular-nums transition hover:scale-110 ${isToday ? 'bg-teal-600 text-white' : 'hover:bg-teal-600/10'} ${has ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''} ${sel && !isToday ? 'bg-slate-200' : ''}`}>{n}</button>
          )
        })}
      </div>
      <p className="mt-3 flex gap-4 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-teal-600" />Today</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full ring-2 ring-emerald-500" />Appointment</span></p>
    </div>
  )
}