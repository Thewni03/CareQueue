import { useState } from 'react'
import { useTheme } from '../theme.jsx'

const Sun = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="#F59E0B">
    <circle cx="12" cy="12" r="5" />
    <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="12" y1="2.2" x2="12" y2="4.6" transform={`rotate(${a} 12 12)`} />)}</g>
  </svg>
)
const Moon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="#FBBF24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>

/** Light: sun sets downward and the moon rises. Dark: the moon rises away and the sun drops back in. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const [anim, setAnim] = useState(null)
  const dark = theme === 'dark'
  const click = (e) => { setAnim(dark ? 'toLight' : 'toDark'); toggle(e) }
  const sun = anim === 'toDark' ? 'animate-sun-down' : anim === 'toLight' ? 'animate-sun-drop' : ''
  const moon = anim === 'toDark' ? 'animate-moon-rise' : anim === 'toLight' ? 'animate-moon-up' : ''
  return (
    <button type="button" onClick={click} role="switch" aria-checked={dark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="glass relative h-10 w-10 shrink-0 overflow-hidden rounded-xl transition hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
      <span className={`absolute inset-0 flex items-center justify-center ${sun}`} style={{ opacity: dark ? 0 : 1 }}><Sun /></span>
      <span className={`absolute inset-0 flex items-center justify-center ${moon}`} style={{ opacity: dark ? 1 : 0 }}><Moon /></span>
    </button>
  )
}