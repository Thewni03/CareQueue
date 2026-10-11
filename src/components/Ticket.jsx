import { useState } from 'react'
import { useTilt } from '../hooks'
import { dayLabel, money, payLabel, time12 } from '../fmt'
import QueueTrack from './QueueTrack'
import { Avatar, Pill, payTone } from './ui.jsx'

const Bars = ({ seed }) => (
  <div className="flex h-9 items-end gap-px" aria-hidden="true">
    {Array.from(seed.padEnd(32, '7')).slice(-32).map((c, i) => <span key={i} className="bg-slate-700" style={{ width: 1 + (c.charCodeAt(0) % 3), height: `${55 + (c.charCodeAt(0) % 5) * 11}%` }} />)}
  </div>
)

/** Circular progress around the token number: how much of the line before you has been seen. */
function Ring({ value, children }) {
  const r = 44, c = 2 * Math.PI * r
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="7" className="stroke-slate-100" />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-teal-600 transition-all duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
      </svg>
      {children}
    </div>
  )
}

const statusOf = (a, t, beingSeen) =>
  a.status === 'SERVED' ? { label: 'Completed', dot: 'bg-slate-300' }
  : a.status === 'HELD' ? { label: 'Payment pending', dot: 'bg-red-400' }
  : beingSeen ? { label: 'Your turn', dot: 'bg-emerald-300 animate-pulse' }
  : t.ahead <= 5 ? { label: 'Almost your turn', dot: 'bg-emerald-300 animate-pulse' }
  : { label: 'In queue', dot: 'bg-teal-200' }

export default function Ticket({ t, onPay, onCancel }) {
  const a = t.appointment
  const tilt = useTilt(5)
  const [copied, setCopied] = useState(false); const [showReceipt, setShowReceipt] = useState(false)
  const held = a.status === 'HELD', done = a.status === 'SERVED'
  const beingSeen = a.status === 'BOOKED' && a.tokenNumber === t.nowServing
  const st = statusOf(a, t, beingSeen)
  const progress = done || beingSeen ? 1 : a.status === 'BOOKED' ? t.nowServing / (t.nowServing + t.ahead + 1) : 0
  const copy = async () => { try { await navigator.clipboard.writeText(a.receipt); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }

  return (
    <article {...tilt} style={{ transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))', transition: 'transform .15s ease-out' }}
      className="group relative animate-ticket-in overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft hover:shadow-lift">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,0%), rgba(255,255,255,.28), transparent 45%)' }} />

      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 px-5 py-4 text-white">
        <span aria-hidden="true" className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={a.doctorName} className="h-11 w-11 bg-white/20 text-sm" />
            <div><p className="font-bold leading-tight">{a.doctorName}</p><p className="text-xs text-teal-100">{a.specialization} · {a.hospitalName}</p></div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold"><i className={`h-2 w-2 rounded-full ${st.dot}`} />{st.label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <div><p className="text-xs text-slate-500">Clinic starts</p><p className="font-bold">{dayLabel(a.date)}, {time12(a.startTime)}</p></div>
          <div className="flex flex-wrap items-center gap-2"><Pill tone={payTone[a.paymentStatus]}>{payLabel[a.paymentStatus]}</Pill><span className="text-xs text-slate-500">{money(a.fee)}</span></div>
        </div>
        <Ring value={progress}>
          <span className="text-center"><span className="block text-[10px] font-semibold text-slate-500">TOKEN</span><span className="block text-5xl font-extrabold leading-none text-teal-700 tabular-nums">{a.tokenNumber}</span></span>
        </Ring>
      </div>

      <div className="relative border-t-2 border-dashed border-slate-200">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" /><span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
      </div>

      <div className="space-y-3 px-5 pb-5 pt-4">
        {held && <><p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Token held for payment. It's released if you don't finish in time.</p>
          <button className="btn-confirm w-full" onClick={() => onPay(a)}>Complete payment</button></>}
        {beingSeen && <p className="animate-pulse-ring rounded-xl bg-emerald-600 px-3 py-3 text-center font-bold text-white">It's your turn. Please go in.</p>}
        {done && <p className="text-sm font-semibold text-slate-600">Consultation complete. Take care.</p>}
        {a.status === 'BOOKED' && !beingSeen && (
          <>
            <QueueTrack ahead={t.ahead} nowServing={t.nowServing} mine={a.tokenNumber} />
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs text-slate-500">Estimated wait</p><p className="text-2xl font-extrabold tabular-nums text-slate-800">{t.etaMinutes} <span className="text-sm font-semibold text-slate-500">min</span></p></div>
              <p className="max-w-[11rem] text-right text-xs text-slate-500">{t.etaFromAi ? "AI estimate from this doctor's pace" : 'Based on the doctor\'s average pace'}</p>
            </div>
            {t.ahead <= 5 && <p className="animate-pop rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{t.ahead === 0 ? "You're next. Head to the clinic now." : 'Your turn is close. Time to head over.'}</p>}
          </>
        )}
        {a.receipt && (
          <div className="border-t border-slate-100 pt-3">
            <button className="flex w-full items-center justify-between text-sm font-semibold text-slate-700" onClick={() => setShowReceipt(!showReceipt)} aria-expanded={showReceipt}>
              Receipt <span className={`transition-transform ${showReceipt ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
            </button>
            {showReceipt && (
              <div className="mt-3 animate-fade-up space-y-3 rounded-2xl bg-slate-50 p-3 text-sm">
                <dl className="grid grid-cols-2 gap-2 text-slate-600">
                  <dt>Patient</dt><dd className="text-right font-semibold text-slate-800">{a.patientName}</dd>
                  <dt>Payment</dt><dd className="text-right font-semibold text-slate-800">{(a.paymentMethod || '').replace('_', ' ').toLowerCase()}</dd>
                  <dt>Amount</dt><dd className="text-right font-semibold text-slate-800">{money(a.fee)}</dd>
                </dl>
                <div className="flex items-center justify-between gap-3"><div><Bars seed={a.receipt.slice(-32)} /><p className="mt-1 text-[11px] text-slate-500">Ref {a.receipt.slice(-10).toUpperCase()}</p></div>
                  <button className="btn-outline px-3 py-1.5" onClick={copy}>{copied ? 'Copied' : 'Copy receipt'}</button></div>
              </div>
            )}
          </div>
        )}
        {!done && <button className="text-sm font-semibold text-red-600 hover:underline" onClick={() => onCancel(a)}>{a.paymentStatus === 'PAID' ? 'Cancel booking and request refund' : 'Cancel booking'}</button>}
      </div>
    </article>
  )
}