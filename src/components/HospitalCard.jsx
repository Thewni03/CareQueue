import { useId } from 'react'
import { useTilt } from '../hooks'

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7)

/** Generated building illustration, colours chosen from the hospital's name. */
export function HospitalArt({ name = '' }) {
  const h = hash(name), uid = useId().replace(/:/g, '')
  const sky1 = `hsl(${160 + (h % 40)} 45% 82%)`, sky2 = `hsl(${170 + (h % 40)} 40% 94%)`
  const wins = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) wins.push(<rect key={`${r}${c}`} x={102 + c * 24} y={72 + r * 22} width="12" height="12" rx="2" fill="#BFE3DE" />)
  return (
    <svg aria-hidden="true" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky1} /><stop offset="1" stopColor={sky2} /></linearGradient></defs>
      <rect width="320" height="180" fill={`url(#${uid})`} />
      <circle cx={50 + (h % 220)} cy="36" r="15" fill="#fff" opacity=".75" /><ellipse cx="250" cy="30" rx="26" ry="9" fill="#fff" opacity=".6" />
      <rect x="44" y="104" width="58" height="62" fill="#F4FAF9" stroke="#9DB8B4" strokeWidth="1.5" /><rect x="218" y="104" width="58" height="62" fill="#F4FAF9" stroke="#9DB8B4" strokeWidth="1.5" />
      <rect x="92" y="52" width="136" height="114" fill="#FBFEFD" stroke="#9DB8B4" strokeWidth="1.5" />
      {wins}
      <rect x="148" y="136" width="24" height="30" rx="3" fill="#0D9488" />
      <rect x="140" y="28" width="40" height="26" rx="5" fill="#0D9488" /><path d="M160 33v16M152 41h16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      {[52, 84].map((x) => <rect key={x} x={x} y="116" width="10" height="10" rx="2" fill="#BFE3DE" />)}{[226, 258].map((x) => <rect key={x} x={x} y="116" width="10" height="10" rx="2" fill="#BFE3DE" />)}
      <rect y="164" width="320" height="16" fill="#A9C79A" />
      <circle cx="26" cy="152" r="16" fill="#86AC76" /><rect x="24" y="160" width="4" height="8" fill="#6B5B45" /><circle cx="296" cy="152" r="16" fill="#86AC76" /><rect x="294" y="160" width="4" height="8" fill="#6B5B45" />
    </svg>
  )
}

const Pin = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>

export default function HospitalCard({ h, province, image, onSelect, compact = false }) {
  const tilt = useTilt(4)
  const none = h.specializations.length === 0
  return (
    <button type="button" {...tilt} onClick={() => !none && onSelect(h)} disabled={none} aria-label={`${h.name}${none ? ', no sessions yet' : ''}`}
      style={{ transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))', transition: 'transform .15s ease-out, box-shadow .2s' }}
      className={`card group flex w-full flex-col overflow-hidden p-0 text-left ${none ? 'opacity-70' : 'hover:shadow-lift'} ${compact ? 'min-w-[17rem]' : ''}`}>
      <span className="relative block h-40 overflow-hidden bg-sage-100">
        <span className="block h-full w-full transition-transform duration-500 group-hover:scale-110">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <HospitalArt name={h.name} />}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-teal-700 shadow-sm">{province.replace(' Province', '')}</span>
        {!none && <span className="absolute bottom-2.5 right-3 flex translate-y-2 items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white opacity-0 shadow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Book now <span aria-hidden="true">→</span></span>}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-bold leading-snug">{h.name}</span>
        <span className="flex items-start gap-1.5 text-sm text-slate-500"><Pin />{h.address || h.city || 'Sri Lanka'}</span>
        <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {none ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">No sessions yet</span> : <>
            {h.specializations.slice(0, 3).map((x) => <span key={x} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{x}</span>)}
            {h.specializations.length > 3 && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">+{h.specializations.length - 3}</span>}</>}
        </span>
      </span>
    </button>
  )
}