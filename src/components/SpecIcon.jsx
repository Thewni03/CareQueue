/** Line icons for the department tiles. Falls back to a medical cross. */
const ICONS = {
  cardio: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  pedia: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
  general: <><path d="M6 3H5a1 1 0 0 0-1 1v5a5 5 0 0 0 10 0V4a1 1 0 0 0-1-1h-1" /><path d="M9 14v1a5 5 0 0 0 10 0v-2" /><circle cx="19" cy="11" r="2" /></>,
  derma: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  ortho: <><path d="M8.5 15.5l7-7" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="5" cy="14.5" r="1.5" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="14.5" cy="5" r="1.5" /><circle cx="19" cy="9.5" r="1.5" /></>,
  ent: <path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S14 18 12 18a3 3 0 0 1-3-3" />,
  cross: <path d="M12 5v14M5 12h14" />,
}
const pick = (n = '') => { const s = n.toLowerCase()
  return s.includes('cardio') ? 'cardio' : s.includes('pedia') ? 'pedia' : s.includes('general') ? 'general'
    : s.includes('derma') ? 'derma' : s.includes('ortho') ? 'ortho' : s.includes('ent') ? 'ent' : 'cross' }

export default function SpecIcon({ name, className = 'h-6 w-6' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{ICONS[pick(name)]}</svg>
}
