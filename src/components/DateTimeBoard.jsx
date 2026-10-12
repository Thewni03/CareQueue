import { useEffect, useState } from 'react'

/** Small board in the corner: 24h time + month and day. Slides in after load, fades while scrolling, never blocks clicks. */
export default function DateTimeBoard() {
  const [now, setNow] = useState(new Date())
  const [ready, setReady] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000), s = setTimeout(() => setReady(true), 800); return () => { clearInterval(t); clearTimeout(s) } }, [])
  useEffect(() => {
    let id
    const on = () => { setScrolling(true); clearTimeout(id); id = setTimeout(() => setScrolling(false), 900) }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); clearTimeout(id) }
  }, [])

  const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0')
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-4 right-4 z-30 flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-slate-800/95 text-white shadow-lift transition-all duration-700 ease-out"
      style={{ opacity: ready ? (scrolling ? 0.28 : 1) : 0, transform: ready ? 'none' : 'translateY(40px) scale(.9)' }}>
      <div className="flex items-center px-3 py-2 font-mono text-xl font-bold tabular-nums">{hh}<span className={now.getSeconds() % 2 ? 'opacity-30' : ''}>:</span>{mm}</div>
      <div className="flex flex-col items-center justify-center border-l border-white/15 bg-teal-600 px-3 py-1 leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50">{now.toLocaleDateString('en-US', { month: 'short' })}</span>
        <span className="text-xl font-extrabold tabular-nums">{now.getDate()}</span>
      </div>
    </div>
  )
}