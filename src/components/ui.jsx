import { useEffect } from 'react'

export const ErrorNote = ({ children }) =>
  children ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p> : null
export const Empty = ({ children }) => <p className="py-8 text-center text-sm text-slate-500">{children}</p>

const tones = {
  green: 'bg-emerald-50 text-emerald-700', teal: 'bg-teal-50 text-teal-700', slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-50 text-red-700', blue: 'bg-blue-50 text-blue-700',
}
export const Pill = ({ tone = 'slate', children }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>

export function Modal({ onClose, children, label }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={label} className="max-h-[94vh] w-full max-w-md overflow-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">{children}</div>
    </div>
  )
}

export const payTone = { PAID: 'green', PAY_AT_COUNTER: 'slate', UNPAID: 'red', REFUND_PENDING: 'blue' }
