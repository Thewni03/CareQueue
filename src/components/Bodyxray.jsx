/** Stylised X-ray of a human body. `focus` lights up the area for the patient's next appointment. */
export default function BodyXray({ focus = null }) {
    const ribs = [96, 108, 120, 132, 144, 156]
    const glow = 'url(#xglow)'
    const on = (k) => focus === k
    return (
      <svg viewBox="0 0 200 360" className="mx-auto h-full max-h-[26rem] w-full" role="img" aria-label={focus ? `X-ray body highlighting the ${focus}` : 'X-ray of a human body'}>
        <defs>
          <filter id="xglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="xscan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5eead4" stopOpacity="0" /><stop offset="1" stopColor="#5eead4" stopOpacity=".55" /></linearGradient>
        </defs>
        <g fill="none" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter={glow} opacity=".85">
          <ellipse cx="100" cy="38" rx="23" ry="28" className={on('head') ? 'animate-pulse' : ''} strokeWidth={on('head') ? 3 : 1.6} stroke={on('head') ? '#fbbf24' : '#5eead4'} />
          <ellipse cx="91" cy="36" rx="5" ry="4" /><ellipse cx="109" cy="36" rx="5" ry="4" /><path d="M100 42v6M90 56q10 6 20 0" />
          <path d="M92 64v18M108 64v18" />
          <path d="M100 82 Q72 78 48 92 M100 82 Q128 78 152 92" />
          <path d="M48 92 Q38 150 54 230 L60 252 Q100 266 140 252 L146 230 Q162 150 152 92" opacity=".55" className={on('skin') ? 'animate-pulse' : ''} stroke={on('skin') ? '#fbbf24' : '#5eead4'} strokeWidth={on('skin') ? 3 : 1.6} />
          {ribs.map((y) => <g key={y} opacity=".7"><path d={`M100 ${y} Q74 ${y - 10} 62 ${y + 12}`} /><path d={`M100 ${y} Q126 ${y - 10} 138 ${y + 12}`} /></g>)}
          <g stroke={on('spine') ? '#fbbf24' : '#5eead4'} strokeWidth={on('spine') ? 3 : 1.6}>{Array.from({ length: 14 }, (_, i) => <rect key={i} x="95" y={84 + i * 11} width="10" height="7" rx="2.5" />)}</g>
          <path d="M60 236 Q58 262 80 270 L100 258 L120 270 Q142 262 140 236 Q120 244 100 244 Q80 244 60 236Z" opacity=".8" />
          <path d="M48 92 Q30 150 28 232 M152 92 Q170 150 172 232 M28 232l-4 26M172 232l4 26" opacity=".7" />
          <path d="M82 268 L76 345 M118 268 L124 345 M70 345h14M116 345h14" opacity=".8" />
        </g>
        <g className="origin-center animate-heartbeat" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <path d="M88 118c-6-9-20-3-14 8 4 8 14 14 14 14s10-6 14-14c6-11-8-17-14-8z" transform="translate(12 6)" fill={on('heart') ? 'rgba(251,113,133,.45)' : 'rgba(94,234,212,.08)'} stroke={on('heart') ? '#fb7185' : '#5eead4'} strokeWidth={on('heart') ? 2.4 : 1.2} filter={glow} />
        </g>
        <rect x="0" y="0" width="200" height="22" fill="url(#xscan)" className="animate-xscan" opacity=".7" />
      </svg>
    )
  }