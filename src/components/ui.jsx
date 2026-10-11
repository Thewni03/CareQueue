import { useEffect } from 'react'
import { useCountUp } from '../hooks'

export const ErrorNote = ({ children }) =>
  children ? <p role="alert" className="animate-fade-up rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{children}</p> : null
export const Empty = ({ children }) => <p className="py-8 text-center text-sm text-slate-500">{children}</p>
export const Skeleton = ({ className = 'h-24' }) => <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />

const tones = {
  green: 'bg-emerald-50 text-emerald-700', teal: 'bg-teal-50 text-teal-700', slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-50 text-red-700', blue: 'bg-blue-50 text-blue-700',
}
export const Pill = ({ tone = 'slate', children }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>

/** Initials in a gradient circle, used for doctors, hospitals and users. */
export function Avatar({ name = '', className = 'h-11 w-11 text-sm' }) {
  const parts = name.replace(/^dr\.?\s*/i, '').trim().split(/\s+/)
  const ini = ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-slate-600 font-bold text-white ${className}`}>{ini}</span>
}

export function Modal({ onClose, children, label }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={label} className="max-h-[94vh] w-full max-w-md animate-fade-up overflow-auto rounded-t-3xl bg-white p-5 shadow-lift sm:rounded-3xl">{children}</div>
    </div>
  )
}

export const payTone = { PAID: 'green', PAY_AT_COUNTER: 'slate', UNPAID: 'red', REFUND_PENDING: 'blue' }

const bars = { teal: 'bg-teal-600', green: 'bg-emerald-600', blue: 'bg-blue-600', slate: 'bg-slate-500', red: 'bg-red-600' }
/** Dashboard number tile. Numbers count up; strings are shown as given. */
export function StatTile({ label, value, hint, tone = 'teal' }) {
  const n = useCountUp(typeof value === 'number' ? value : 0)
  return (
    <div className="card relative overflow-hidden py-4 pl-6 hover:-translate-y-0.5 hover:shadow-lift">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${bars[tone]}`} />
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-teal-700">{typeof value === 'number' ? n : value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}