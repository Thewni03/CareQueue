import SpecIcon from './SpecIcon.jsx'

const HospitalIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V9l8-5 8 5v12z" /><path d="M9 21v-5h6v5" /><path d="M12 9v4M10 11h4" strokeWidth="2.2" />
  </svg>
)
const DoctorIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7.5" r="3.5" /><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" /><path d="M10 14l2 4 2-4" />
  </svg>
)

function Node({ i, step, icon, label, value, onClick }) {
  const done = i < step, current = i === step
  return (
    <button type="button" disabled={!done} onClick={onClick} aria-current={current ? 'step' : undefined}
      className="group flex w-24 shrink-0 flex-col items-center gap-1.5 focus:outline-none sm:w-28">
      <span className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${done ? 'bg-teal-600 text-white shadow-lift group-hover:scale-110' : current ? 'animate-pulse-ring scale-110 border-[3px] border-teal-600 bg-white text-teal-700' : 'border-2 border-dashed border-slate-300 bg-white text-slate-400'}`}>
        {icon}
        {done && <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-2 ring-white">✓</span>}
      </span>
      <span className={`text-sm font-bold ${done || current ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
      <span className="line-clamp-2 min-h-[2rem] text-center text-xs leading-tight text-slate-500">{done ? value : current ? 'Choose now' : ''}</span>
    </button>
  )
}

const Link = ({ filled, flowing }) => (
  <span aria-hidden="true" className="relative mt-8 h-1.5 flex-1 self-start overflow-hidden rounded-full bg-slate-200">
    <span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 transition-all duration-700" style={{ width: filled ? '100%' : flowing ? '45%' : '0%' }}>
      {(filled || flowing) && <span className="stripes absolute inset-0 animate-flow rounded-full" />}
    </span>
  </span>
)

/** Hospital → Specialty → Doctor as three nodes joined by lines that fill as you choose. Tap a finished node to go back. */
export default function StepJourney({ step, hospital, spec, onBack }) {
  return (
    <nav aria-label="Booking progress" className="card flex items-start justify-between gap-1 px-3 py-5 sm:px-6">
      <Node i={0} step={step} icon={<HospitalIcon />} label="Hospital" value={hospital?.name} onClick={() => onBack(0)} />
      <Link filled={step > 0} flowing={step === 0} />
      <Node i={1} step={step} icon={spec ? <SpecIcon name={spec} className="h-7 w-7" /> : <SpecIcon name="general" className="h-7 w-7" />} label="Specialty" value={spec} onClick={() => onBack(1)} />
      <Link filled={step > 1} flowing={step === 1} />
      <Node i={2} step={step} icon={<DoctorIcon />} label="Doctor" value="" onClick={() => {}} />
    </nav>
  )
}