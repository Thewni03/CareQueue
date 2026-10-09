/** Now serving → patients ahead (one bobbing dot each) → you. The "you" pill glows once you're within 5. */
export default function QueueTrack({ ahead, nowServing, mine }) {
  const shown = Math.min(ahead, 7), close = ahead <= 5
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5" role="img" aria-label={`Now serving ${nowServing || 'none'}, ${ahead} patients ahead of you, your token ${mine}`}>
        <span className="flex flex-col items-center">
          <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-teal-600 px-2 text-sm font-bold tabular-nums text-white">{nowServing || '–'}</span>
          <span className="mt-1 text-[10px] font-semibold text-slate-500">NOW</span>
        </span>
        <span className="flex flex-1 items-center justify-evenly gap-1 border-y border-dashed border-slate-300 py-3">
          {Array.from({ length: shown }, (_, i) => <span key={i} className="h-3.5 w-3.5 shrink-0 animate-bob rounded-full bg-slate-400" style={{ animationDelay: `${i * 220}ms` }} />)}
          {ahead > 7 && <span className="text-xs font-bold text-slate-500">+{ahead - 7}</span>}
          {ahead === 0 && <span className="text-xs font-semibold text-emerald-700">You're next</span>}
        </span>
        <span className="flex flex-col items-center">
          <span className={`flex h-10 items-center rounded-full px-3.5 text-sm font-extrabold tabular-nums text-white ${close ? 'animate-pulse-ring bg-emerald-600' : 'bg-slate-600'}`}>#{mine}</span>
          <span className="mt-1 text-[10px] font-semibold text-slate-500">YOU</span>
        </span>
      </div>
    </div>
  )
}