/** Tokens drawn as waiting-room seats in front of the doctor's door. Taken seats show a person; yours bounces with a tag. */
const Person = () => <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><circle cx="8" cy="5" r="3" /><path d="M2 15c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5z" /></svg>

export default function TokenStrip({ board, mine }) {
  if (!board) return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
  const taken = new Set(board.taken)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl bg-teal-600 px-3 py-2 text-white">
        <span className="flex items-center gap-2 text-sm font-bold"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21V4h12v17M4 21h16M14 12h.01" /></svg>Doctor's room</span>
        <span className="text-xs font-semibold">{board.nowServing ? `Now seeing #${board.nowServing}` : 'Not started yet'}</span>
      </div>
      <div className="grid grid-cols-5 gap-x-2 gap-y-4 pt-4 sm:grid-cols-10" role="img" aria-label={`${board.taken.length} of ${board.maxTokens} tokens booked`}>
        {Array.from({ length: board.maxTokens }, (_, i) => i + 1).map((n) => {
          const yours = n === mine || (!mine && n === board.nextToken), serving = n === board.nowServing
          const [cls, hint] = yours ? ['border-emerald-700 bg-emerald-600 text-white animate-pulse-ring', mine ? 'Your token' : 'Your token if you book now']
            : serving ? ['border-teal-800 bg-teal-600 text-white', 'Being seen']
            : taken.has(n) ? ['border-slate-400 bg-slate-200 text-slate-500', 'Booked']
            : ['border-sage-300 bg-sage-100 text-sage-700', 'Free']
          return (
            <span key={n} title={`Token ${n}: ${hint}`} style={{ animationDelay: `${n * 25}ms` }} className="relative flex animate-pop justify-center">
              {yours && <span className="absolute -top-5 animate-bob rounded-full bg-emerald-600 px-1.5 text-[10px] font-extrabold text-white">YOU</span>}
              <span className={`flex h-11 w-9 cursor-default flex-col items-center justify-center gap-0.5 rounded-t-xl rounded-b-md border-b-[5px] text-xs font-bold tabular-nums transition-transform hover:-translate-y-1 hover:scale-110 ${cls}`}>
                {taken.has(n) && !yours && !serving ? <Person /> : null}{n}
              </span>
            </span>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {board.taken.length > 0 ? `Tokens ${board.taken[0]}–${board.taken[board.taken.length - 1]} are booked. ` : 'No tokens booked yet. '}
        {board.nextToken ? <>Your token will be <b className="text-emerald-700">#{board.nextToken}</b>.</> : <b className="text-red-600">This session is full.</b>}
      </p>
      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" />Booked</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-teal-600" />Being seen</span>
        <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-600" />Yours</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-sage-200" />Free</span>
      </p>
    </div>
  )
}