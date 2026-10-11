import { useMemo } from 'react'

const COLORS = ['#0D9488', '#059669', '#2563EB', '#475569', '#14B8A6']

/** One-shot burst. Hidden automatically when motion is reduced (see index.css). */
export default function Confetti({ count = 30 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: (Math.random() - 0.5) * 340, y: 140 + Math.random() * 240, r: (Math.random() - 0.5) * 720,
    c: COLORS[i % COLORS.length], d: Math.random() * 0.25, w: 6 + Math.random() * 6,
  })), [count])
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-16 z-20">
      {pieces.map((p) => <span key={p.id} className="absolute block animate-confetti rounded-sm"
        style={{ '--x': p.x + 'px', '--y': p.y + 'px', '--r': p.r + 'deg', background: p.c, width: p.w, height: p.w * 0.6, animationDelay: p.d + 's' }} />)}
    </div>
  )
}
