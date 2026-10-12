/** Friendly line-art doctor holding a clipboard. Idle bobbing, blinking and a tilting clipboard. */
export function DoctorIllustration({ className = '' }) {
    const eye = { transformBox: 'fill-box', transformOrigin: 'center' }
    return (
      <svg viewBox="0 0 300 370" className={className} role="img" aria-label="Illustration of a friendly doctor holding a clipboard">
        <g className="animate-bob">
          <path d="M70 370 L78 215 Q82 168 128 156 L172 156 Q218 168 222 215 L230 370 Z" fill="#fff" className="ink" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M130 156 L150 232 L170 156 Z" fill="#8DB27E" className="ink" strokeWidth="3" strokeLinejoin="round" />
          <path d="M128 158 L146 198 M172 158 L154 198" fill="none" className="ink" strokeWidth="3" strokeLinecap="round" />
          <path d="M132 160 C112 210 120 250 150 262 C176 270 190 248 186 226" fill="none" stroke="#5E8F55" strokeWidth="5" strokeLinecap="round" />
          <circle cx="186" cy="226" r="8" fill="#8DB27E" className="ink" strokeWidth="3" />
          <rect x="136" y="128" width="28" height="30" fill="#FBE3CF" />
          <ellipse cx="150" cy="95" rx="42" ry="48" fill="#FBE3CF" className="ink" strokeWidth="3.5" />
          <circle cx="108" cy="100" r="9" fill="#FBE3CF" className="ink" strokeWidth="3" /><circle cx="192" cy="100" r="9" fill="#FBE3CF" className="ink" strokeWidth="3" />
          <path d="M108 90 C106 52 128 40 150 40 C176 40 194 54 192 90 C182 70 168 64 150 64 C132 64 118 72 108 90 Z" fill="#6B7378" className="ink" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="134" cy="98" r="13" fill="none" className="ink" strokeWidth="3.5" /><circle cx="166" cy="98" r="13" fill="none" className="ink" strokeWidth="3.5" /><path d="M147 98 H153" className="ink" strokeWidth="3.5" />
          <circle cx="134" cy="98" r="3" className="ink-fill animate-blink" style={eye} /><circle cx="166" cy="98" r="3" className="ink-fill animate-blink" style={eye} />
          <path d="M137 122 Q150 133 163 122" fill="none" className="ink" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M80 220 Q56 290 92 326 L116 308 Q96 282 104 238 Z" fill="#fff" className="ink" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M220 220 Q244 290 208 326 L184 308 Q204 282 196 238 Z" fill="#fff" className="ink" strokeWidth="3.5" strokeLinejoin="round" />
          <g className="animate-tilt" style={{ transformOrigin: '150px 292px' }}>
            <rect x="92" y="250" width="116" height="84" rx="8" fill="#DDE5EF" className="ink" strokeWidth="3.5" />
            <rect x="132" y="243" width="36" height="13" rx="4" fill="#C3CEDC" className="ink" strokeWidth="3" />
            <path d="M106 278 H194 M106 294 H178 M106 310 H186" stroke="#B3C0D1" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="104" cy="320" r="12" fill="#FBE3CF" className="ink" strokeWidth="3" /><circle cx="196" cy="318" r="12" fill="#FBE3CF" className="ink" strokeWidth="3" />
        </g>
      </svg>
    )
  }
  
  export function Plant({ className = '' }) {
    return (
      <svg aria-hidden="true" viewBox="0 0 80 110" className={className}>
        <g className="animate-sway" style={{ transformOrigin: '40px 72px' }}>
          <path d="M40 72 C38 56 40 44 44 34" fill="none" stroke="#5E8F55" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 66 C14 62 8 38 22 26 C36 38 38 54 40 66 Z" fill="#8DB27E" className="ink" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M42 56 C66 52 74 28 60 16 C46 28 43 44 42 56 Z" fill="#A9C79A" className="ink" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <path d="M16 72 H64 L58 104 Q57 108 52 108 H28 Q23 108 22 104 Z" fill="#F6E8C6" className="ink" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    )
  }
  
  export const Sparkle = ({ className = '' }) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`animate-twinkle ${className}`} fill="#E9D8A6"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" /></svg>
  )