/** Small animated doctor. Hair, skin, glasses and bun are picked from the name so each doctor looks different. */
const HAIR = ['#4B5563', '#78350F', '#1F2937', '#9CA3AF'], SKIN = ['#FBE3CF', '#F2C9A5', '#D9A47C', '#B9805A']
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

export default function DoctorAvatar({ name = '', className = 'h-14 w-14', still = false }) {
  const h = hash(name), hair = HAIR[h % 4], skin = SKIN[(h >> 3) % 4], glasses = h % 3 !== 0, bun = h % 5 === 0
  const eye = { transformBox: 'fill-box', transformOrigin: 'center' }
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={`${className} overflow-hidden rounded-full bg-sage-100 ${still ? '' : 'animate-bob'}`}>
      <path d="M8 64 Q10 46 32 44 Q54 46 56 64 Z" fill="#fff" className="ink" strokeWidth="1.6" />
      <path d="M26 45 L32 57 L38 45 Z" fill="#8DB27E" />
      <rect x="28" y="38" width="8" height="8" fill={skin} />
      <ellipse cx="32" cy="29" rx="12" ry="13" fill={skin} className="ink" strokeWidth="1.6" />
      {bun && <circle cx="32" cy="9" r="4.5" fill={hair} />}
      <path d="M20 27 C19 14 27 11 32 11 C38 11 45 14 44 27 C41 21 37 19 32 19 C27 19 23 21 20 27 Z" fill={hair} />
      {glasses && <g fill="none" className="ink" strokeWidth="1.3"><circle cx="27" cy="30" r="4" /><circle cx="37" cy="30" r="4" /><path d="M31 30 H33" /></g>}
      <circle cx="27" cy="30" r="1.3" className="ink-fill animate-blink" style={eye} /><circle cx="37" cy="30" r="1.3" className="ink-fill animate-blink" style={eye} />
      <path d="M28 37 Q32 40 36 37" fill="none" className="ink" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}