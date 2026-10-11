export const money = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`
export const time12 = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
export function dayLabel(d) {
  const iso = (x) => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const now = new Date(); const tm = new Date(now.getTime() + 86400000)
  if (d === iso(now)) return 'Today'
  if (d === iso(tm)) return 'Tomorrow'
  return new Date(d + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
export const payLabel = { PAID: 'Paid', PAY_AT_COUNTER: 'Pay at counter', UNPAID: 'Awaiting payment', REFUND_PENDING: 'Refund pending' }
