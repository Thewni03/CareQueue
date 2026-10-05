/** Now serving → patients ahead (one dot each) → you. The "you" pill glows once you're within 5. */
export default function QueueTrack({ ahead, nowServing, mine }) {
  const shown = Math.min(ahead, 8), close = ahead <= 5
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span title="Now serving" className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-teal-600 px-2 text-sm font-bold text-white tabular-nums">{nowServing || '–'}</span>
        {Array.from({ length: shown }, (_, i) => <span key={i} className="h-3.5 w-3.5 shrink-0 animate-pop rounded-full bg-slate-300" style={{ animationDelay: `${i * 45}ms` }} />)}
        {ahead > 8 && <span className="text-xs font-semibold text-slate-500">+{ahead - 8}</span>}
        <span className="h-px flex-1 border-t border-dashed border-slate-300" />
        <span className={`flex h-9 items-center rounded-full px-3 text-sm font-extrabold text-white tabular-nums ${close ? 'animate-pulse-ring bg-emerald-600' : 'bg-slate-600'}`}>#{mine}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Being seen now, then {ahead} ahead of you</p>
    </div>
  )
}
