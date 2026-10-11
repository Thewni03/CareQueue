import { useState } from 'react'
import { api } from '../api'
import { useCountdown } from '../hooks'
import { money, time12 } from '../fmt'
import Confetti from './Confetti.jsx'
import { ErrorNote, Modal } from './ui.jsx'

const group = (d) => d.replace(/(.{4})/g, '$1 ').trim()

function CardPreview({ number, name, expiry, flipped, cvc }) {
  const brand = number.startsWith('4') ? 'VISA' : /^5[1-5]/.test(number) ? 'MASTERCARD' : 'CARD'
  const shown = group(number.padEnd(16, '•').slice(0, Math.max(16, number.length)))
  const face = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }
  return (
    <div style={{ perspective: 900 }} className="mx-auto mb-5 h-48 w-full max-w-sm">
      <div style={{ transformStyle: 'preserve-3d', transition: 'transform .6s', transform: flipped ? 'rotateY(180deg)' : 'none' }} className="relative h-full w-full">
        <div style={face} className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-slate-700 p-5 text-white shadow-lift">
          <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute inset-y-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex items-center justify-between">
            <svg aria-hidden="true" viewBox="0 0 40 30" className="h-8 w-11"><rect width="40" height="30" rx="5" fill="#F5D77A" /><path d="M0 10h40M0 20h40M14 0v30M26 0v30" stroke="#C9A93E" strokeWidth="1.2" fill="none" /></svg>
            <span className="flex items-center gap-3"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 8a6 6 0 0 1 0 8M12 5a10 10 0 0 1 0 14M16 3a14 14 0 0 1 0 18" /></svg><span className="text-sm font-extrabold tracking-wider">{brand}</span></span>
          </div>
          <p className="relative text-xl font-semibold tabular-nums tracking-[.18em]">{shown}</p>
          <div className="relative flex justify-between text-xs"><span><span className="block text-[9px] opacity-70">CARD HOLDER</span><span className="uppercase">{name || 'Your name'}</span></span><span><span className="block text-[9px] opacity-70">EXPIRES</span>{expiry || 'MM/YY'}</span></div>
        </div>
        <div style={{ ...face, transform: 'rotateY(180deg)' }} className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700 to-teal-700 pt-7 text-white shadow-lift">
          <div className="h-10 bg-slate-900" />
          <div className="mx-5 mt-5 flex items-center justify-between"><span className="text-[10px] opacity-70">SECURITY CODE</span><span className="rounded bg-white px-4 py-1.5 text-sm font-bold tabular-nums text-slate-800">{cvc || '•••'}</span></div>
        </div>
      </div>
    </div>
  )
}

const Lock = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
const Cash = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.8" /><path d="M6 9.5v.01M18 14.5v.01" strokeWidth="2.4" /></svg>

export default function PaymentModal({ appointment: a, onPaid, onClose }) {
  const left = useCountdown(a.heldUntil)
  const [tab, setTab] = useState('CARD')
  const [f, setF] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [flip, setFlip] = useState(false)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [sheet, setSheet] = useState(false)
  const [ok, setOk] = useState(null)

  const pay = async (method) => {
    setBusy(true); setError('')
    try {
      const done = await api('/payments/process', { method: 'POST', body: { appointmentId: a.id, method, cardNumber: f.number, expiry: f.expiry, cvc: f.cvc, cardName: f.name } })
      setSheet(false); setOk(done)
      setTimeout(() => onPaid(done), 2300)   // let the success animation play
    } catch (e) { setError(e.message); setSheet(false) } finally { setBusy(false) }
  }
  const applePay = () => { setSheet(true); setTimeout(() => pay('APPLE_PAY'), 1400) }
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const expired = left === 0

  const tabBtn = (k, label) => (
    <button type="button" onClick={() => setTab(k)} className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${tab === k ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
  )

  if (ok) return (
    <Modal onClose={() => onPaid(ok)} label="Booking confirmed">
      <div className="relative py-8 text-center">
        <Confetti />
        <svg aria-hidden="true" viewBox="0 0 52 52" className="mx-auto h-24 w-24">
          <circle cx="26" cy="26" r="24" fill="none" strokeWidth="3" className="stroke-emerald-600" />
          <path d="M14 27l8 8 16-17" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" className="animate-draw stroke-emerald-600" />
        </svg>
        <h2 className="mt-4 animate-fade-up text-2xl font-extrabold text-slate-800">You're booked</h2>
        <p className="mt-1 text-sm text-slate-600">{ok.doctorName}, {ok.hospitalName}</p>
        <p className="mt-4 animate-pop text-6xl font-extrabold text-teal-700 tabular-nums">#{ok.tokenNumber}</p>
        <p className="mt-2 text-sm text-slate-500">{ok.paymentStatus === 'PAID' ? 'Payment received.' : 'Pay at the counter on arrival.'} Taking you to your ticket…</p>
      </div>
    </Modal>
  )

  return (
    <Modal onClose={onClose} label="Payment">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="text-lg font-bold text-teal-700">Confirm token #{a.tokenNumber}</h2>
          <p className="text-sm text-slate-600">{a.doctorName}, {a.hospitalName}</p></div>
        <div className={`relative h-16 w-16 shrink-0 ${left < 120 ? 'text-red-700' : 'text-slate-700'}`} role="timer" aria-label={`Token held for ${mm} minutes ${ss} seconds`}>
          <svg aria-hidden="true" viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" strokeWidth="3.5" className="stroke-slate-200" />
            <circle cx="20" cy="20" r="17" fill="none" strokeWidth="3.5" strokeLinecap="round" className={left < 120 ? 'stroke-red-600' : 'stroke-teal-600'}
              strokeDasharray="106.8" strokeDashoffset={106.8 * (1 - Math.min(1, left / 600))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center text-[13px] font-extrabold leading-none tabular-nums">{mm}:{ss}<span className="mt-0.5 text-[9px] font-semibold text-slate-500">HELD</span></span>
        </div>
      </div>

      {expired ? (
        <div className="space-y-3"><ErrorNote>Your hold ran out and token #{a.tokenNumber} was released. Pick a session again to get a new token.</ErrorNote><button className="btn-outline w-full" onClick={onClose}>Back to sessions</button></div>
      ) : (
        <>
          <div className="mb-4 flex gap-1 rounded-xl bg-slate-50 p-1">{tabBtn('CARD', 'Card')}{tabBtn('APPLE_PAY', 'Apple Pay')}{tabBtn('COUNTER', 'Pay at counter')}</div>
          <ErrorNote>{error}</ErrorNote>

          {tab === 'CARD' && (
            <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); pay('CARD') }}>
              <CardPreview {...f} flipped={flip} />
              <div><label className="label" htmlFor="cn">Card number</label>
                <input id="cn" inputMode="numeric" autoComplete="cc-number" required className="input tabular-nums" placeholder="4242 4242 4242 4242" value={group(f.number)} onChange={(e) => setF({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 19) })} /></div>
              <div><label className="label" htmlFor="nm">Name on card</label><input id="nm" autoComplete="cc-name" required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label" htmlFor="ex">Expiry</label>
                  <input id="ex" inputMode="numeric" autoComplete="cc-exp" required className="input" placeholder="MM/YY" value={f.expiry}
                    onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setF({ ...f, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }) }} /></div>
                <div><label className="label" htmlFor="cv">Security code</label>
                  <input id="cv" inputMode="numeric" autoComplete="cc-csc" required className="input" placeholder="123" value={f.cvc}
                    onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} onChange={(e) => setF({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} /></div>
              </div>
              <button className="btn-confirm w-full" disabled={busy}>{busy ? 'Processing…' : `Pay ${money(a.fee)}`}</button>
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500"><Lock />Card details are checked before you pay</p>
              <p className="text-center text-xs text-slate-500">Demo gateway: use 4242 4242 4242 4242, any future date. Ending in 0002 is declined.</p>
            </form>
          )}

          {tab === 'APPLE_PAY' && (
            <div className="mt-3 space-y-3 text-center">
              <button className="w-full rounded-lg bg-black px-4 py-3 text-base font-semibold text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2" onClick={applePay} disabled={busy}>Pay with Apple Pay · {money(a.fee)}</button>
              <p className="text-xs text-slate-500">Demo wallet: simulates the Apple Pay sheet. A live setup needs your merchant ID with PayHere or Stripe.</p>
            </div>
          )}

          {tab === 'COUNTER' && (
            <div className="mt-3 space-y-4">
              <div className="flex flex-col items-center rounded-2xl bg-sage-50 px-4 py-6 text-center">
                <span className="flex h-20 w-20 animate-bob items-center justify-center rounded-full bg-sage-100 text-sage-700"><Cash /></span>
                <p className="mt-3 text-lg font-extrabold">Pay {money(a.fee)} at the clinic desk</p>
                <p className="text-sm text-slate-600">Your place in the queue is secured now.</p>
              </div>
              <ol className="space-y-2.5 text-sm">
                {[`Keep your token #${a.tokenNumber} on your ticket`, `Arrive before ${time12(a.startTime)}`, 'Pay at the desk and show your ticket'].map((t, i) => (
                  <li key={t} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span><span className="text-slate-700">{t}</span></li>))}
              </ol>
              <button className="btn-outline w-full py-3" onClick={() => pay('COUNTER')} disabled={busy}>{busy ? 'Confirming…' : 'Confirm, I will pay at the counter'}</button>
            </div>
          )}
        </>
      )}

      {sheet && (
        <div className="absolute inset-0 z-10 flex items-end justify-center bg-slate-900/60 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 text-center sm:rounded-2xl">
            <p className="text-sm text-slate-500">CareQueue</p><p className="text-2xl font-extrabold">{money(a.fee)}</p>
            <div className="relative mx-auto my-5 h-16 w-16 overflow-hidden rounded-xl border-2 border-teal-600"><span className="absolute inset-x-0 top-0 h-1 animate-scan bg-emerald-500" /></div>
            <p className="text-sm font-semibold text-slate-700">Confirming with Face ID…</p>
          </div>
        </div>
      )}
    </Modal>
  )
}