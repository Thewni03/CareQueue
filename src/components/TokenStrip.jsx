/** Every token in a session as a dot: taken, being served, free, and the one you'll get next. */
export default function TokenStrip({ board, mine }) {
  if (!board) return <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
  const taken = new Set(board.taken)
  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${board.taken.length} of ${board.maxTokens} tokens booked`}>
        {Array.from({ length: board.maxTokens }, (_, i) => i + 1).map((n) => {
          const isMine = n === mine, isNext = !mine && n === board.nextToken, serving = n === board.nowServing
          const cls = isMine ? 'bg-emerald-600 text-white animate-pulse-ring'
            : isNext ? 'bg-emerald-600 text-white animate-pulse-ring'
            : serving ? 'bg-teal-600 text-white'
            : taken.has(n) ? 'bg-slate-300 text-slate-600'
            : 'border border-dashed border-slate-300 text-slate-400'
          return <span key={n} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums ${cls}`}>{n}</span>
        })}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {board.taken.length > 0 ? `Tokens ${board.taken[0]}–${board.taken[board.taken.length - 1]} are booked. ` : 'No tokens booked yet. '}
        {board.nextToken ? <>Your token will be <b className="text-emerald-700">#{board.nextToken}</b>.</> : <b className="text-red-600">This session is full.</b>}
      </p>
      <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />Booked</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-teal-600" />Being seen</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />Yours</span>
      </p>
    </div>
  )
}
