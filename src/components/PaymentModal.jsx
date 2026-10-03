import { useState } from 'react'
import { api } from '../api'
import { useCountdown } from '../hooks'
import { money } from '../fmt'
import { ErrorNote, Modal } from './ui.jsx'

const group = (d) => d.replace(/(.{4})/g, '$1 ').trim()

function CardPreview({ number, name, expiry, flipped, cvc }) {
  const brand = number.startsWith('4') ? 'VISA' : /^5[1-5]/.test(number) ? 'MASTERCARD' : 'CARD'
  const shown = group(number.padEnd(16, '•').slice(0, Math.max(16, number.length)))
  const face = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }
  return (
    <div style={{ perspective: 900 }} className="mx-auto mb-4 h-44 w-full max-w-xs">
      <div style={{ transformStyle: 'preserve-3d', transition: 'transform .5s', transform: flipped ? 'rotateY(180deg)' : 'none' }} className="relative h-full w-full">
        <div style={face} className="absolute inset-0 flex flex-col justify-between rounded-xl bg-gradient-to-br from-teal-600 to-slate-700 p-4 text-white">
          <div className="flex items-center justify-between"><span className="h-7 w-10 rounded bg-white/30" /><span className="text-sm font-extrabold tracking-wider">{brand}</span></div>
          <p className="text-lg font-semibold tabular-nums tracking-widest">{shown}</p>
          <div className="flex justify-between text-xs"><span className="uppercase">{name || 'Name on card'}</span><span>{expiry || 'MM/YY'}</span></div>
        </div>
        <div style={{ ...face, transform: 'rotateY(180deg)' }} className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-700 to-teal-700 pt-6 text-white">
          <div className="h-9 bg-slate-900" />
          <div className="mx-4 mt-4 flex justify-end rounded bg-white px-3 py-1.5 text-sm font-bold tabular-nums text-slate-800">{cvc || '•••'}</div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentModal({ appointment: a, onPaid, onClose }) {
  const left = useCountdown(a.heldUntil)
  const [tab, setTab] = useState('CARD')
  const [f, setF] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [flip, setFlip] = useState(false)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [sheet, setSheet] = useState(false)

  const pay = async (method) => {
    setBusy(true); setError('')
    try {
      const done = await api('/payments/process', { method: 'POST', body: { appointmentId: a.id, method, cardNumber: f.number, expiry: f.expiry, cvc: f.cvc, cardName: f.name } })
      onPaid(done)
    } catch (e) { setError(e.message); setSheet(false) } finally { setBusy(false) }
  }
  const applePay = () => { setSheet(true); setTimeout(() => pay('APPLE_PAY'), 1400) }
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const expired = left === 0

  const tabBtn = (k, label) => (
    <button type="button" onClick={() => setTab(k)} className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${tab === k ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
  )

  return (
    <Modal onClose={onClose} label="Payment">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="text-lg font-bold text-teal-700">Confirm token #{a.tokenNumber}</h2>
          <p className="text-sm text-slate-600">{a.doctorName}, {a.hospitalName}</p></div>
        <div className={`rounded-lg px-3 py-1.5 text-center ${left < 120 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
          <p className="text-[11px]">Held for</p><p className="text-lg font-extrabold tabular-nums">{mm}:{ss}</p>
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
            <div className="mt-3 space-y-3">
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">Keep your token and pay <b>{money(a.fee)}</b> in cash at the clinic desk. Your place in the queue is secured now.</p>
              <button className="btn-outline w-full" onClick={() => pay('COUNTER')} disabled={busy}>{busy ? 'Confirming…' : 'Confirm, I will pay at the counter'}</button>
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
