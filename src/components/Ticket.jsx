import { useState } from 'react'
import { dayLabel, money, payLabel, time12 } from '../fmt'
import QueueTrack from './QueueTrack'
import { Pill, payTone } from './ui.jsx'

const Bars = ({ seed }) => (
  <div className="flex h-8 items-end gap-px" aria-hidden="true">
    {Array.from(seed.padEnd(28, '7')).slice(-28).map((c, i) => <span key={i} className="bg-slate-700" style={{ width: 1 + (c.charCodeAt(0) % 3), height: `${55 + (c.charCodeAt(0) % 5) * 11}%` }} />)}
  </div>
)

export default function Ticket({ t, onPay, onCancel }) {
  const a = t.appointment
  const [copied, setCopied] = useState(false)
  const held = a.status === 'HELD', done = a.status === 'SERVED', beingSeen = a.status === 'BOOKED' && a.tokenNumber === t.nowServing
  const copy = async () => { try { await navigator.clipboard.writeText(a.receipt); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }
  return (
    <article className="relative animate-ticket-in overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="bg-teal-600 px-5 py-3 text-white">
        <p className="text-sm font-semibold">{a.hospitalName}</p>
        <p className="text-xs text-teal-100">{a.doctorName} · {a.specialization}</p>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-xs text-slate-500">Clinic starts</p>
          <p className="font-bold">{dayLabel(a.date)}, {time12(a.startTime)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2"><Pill tone={payTone[a.paymentStatus]}>{payLabel[a.paymentStatus]}</Pill><span className="text-xs text-slate-500">{money(a.fee)}</span></div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Token</p>
          <p className="text-6xl font-extrabold leading-none text-teal-700 tabular-nums">{a.tokenNumber}</p>
        </div>
      </div>

      <div className="relative my-1 border-t-2 border-dashed border-slate-200">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
      </div>

      <div className="space-y-3 px-5 pb-5 pt-3">
        {held && <><p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Token held for payment. It's released if you don't finish in time.</p>
          <button className="btn-confirm w-full" onClick={() => onPay(a)}>Complete payment</button></>}
        {beingSeen && <p className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-bold text-white">It's your turn. Please go in.</p>}
        {done && <p className="text-sm font-semibold text-slate-600">Consultation complete.</p>}
        {a.status === 'BOOKED' && !beingSeen && (
          <>
            <QueueTrack ahead={t.ahead} nowServing={t.nowServing} mine={a.tokenNumber} />
            <p className="text-sm text-slate-700">About <b>{t.etaMinutes} min</b> to go{t.etaFromAi ? ' (AI estimate from this doctor\'s pace)' : ''}.</p>
            {t.ahead <= 5 && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{t.ahead === 0 ? "You're next. Head to the clinic now." : 'Your turn is close. Time to head over.'}</p>}
          </>
        )}
        {a.receipt && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div><Bars seed={a.receipt.slice(-28)} /><p className="mt-1 text-[11px] text-slate-500">Receipt {a.receipt.slice(-10).toUpperCase()}</p></div>
            <button className="btn-outline px-3 py-1.5" onClick={copy}>{copied ? 'Copied' : 'Copy receipt'}</button>
          </div>
        )}
        {!done && <button className="text-sm font-semibold text-red-600 hover:underline" onClick={() => onCancel(a)}>{a.paymentStatus === 'PAID' ? 'Cancel booking and request refund' : 'Cancel booking'}</button>}
      </div>
    </article>
  )
}
