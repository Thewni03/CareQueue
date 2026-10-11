import { useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Avatar } from './ui.jsx'

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5" aria-label="CareQueue home">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </span>
    <span className="text-lg font-extrabold tracking-tight">CareQueue</span>
  </Link>
)

const linksFor = (role, loggedIn) => {
  if (role === 'HOSPITAL') return [{ to: '/counter', label: 'Live counter' }, { to: '/schedule', label: 'Doctors & sessions' }]
  if (role === 'PHARMACY') return [{ to: '/stock', label: 'Stock' }]
  if (role === 'ADMIN') return [{ to: '/admin', label: 'Console' }]
  return [{ to: '/', label: 'Home' }, { to: '/book', label: 'Book' }, { to: '/medicine', label: 'Medicine' },
    ...(loggedIn ? [{ to: '/appointments', label: 'My tickets' }] : []), { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }]
}

/** A highlight pill glides to whichever link you hover, then settles back on the current page. */
function SlidingNav({ items }) {
  const loc = useLocation(); const refs = useRef({})
  const [hover, setHover] = useState(null); const [pos, setPos] = useState({ left: 0, width: 0, o: 0 })
  const active = items.find((i) => (i.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(i.to)))?.to
  const target = hover ?? active
  useLayoutEffect(() => {
    const el = refs.current[target]
    setPos(el ? { left: el.offsetLeft, width: el.offsetWidth, o: 1 } : (p) => ({ ...p, o: 0 }))
  }, [target, items.length, loc.pathname])
  return (
    <div className="relative hidden items-center md:flex" onMouseLeave={() => setHover(null)}>
      <span aria-hidden="true" className="absolute top-0 h-full rounded-full bg-teal-600/10 transition-all duration-300 ease-out" style={{ left: pos.left, width: pos.width, opacity: pos.o }} />
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.to === '/'} ref={(el) => (refs.current[i.to] = el)} onMouseEnter={() => setHover(i.to)} onFocus={() => setHover(i.to)} onBlur={() => setHover(null)}
          className={({ isActive }) => `relative z-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-teal-700' : 'text-slate-600 hover:text-teal-700'}`}>
          {i.label}
          {i.to === active && <span aria-hidden="true" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-teal-600" />}
        </NavLink>))}
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const loc = useLocation()
  const [open, setOpen] = useState(false)
  const items = linksFor(user?.role, !!user)
  const canBook = !user || user.role === 'PATIENT'
  return (
    <header className="sticky top-3 z-40 px-3">
      <div className="glass mx-auto max-w-5xl rounded-2xl px-4 py-2.5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <SlidingNav items={items} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {canBook && <Link to="/book" className="btn-teal hidden px-4 py-2 sm:inline-flex">Book appointment</Link>}
            {user ? (
              <>
                <Link to="/profile" aria-label="My profile" className="rounded-full transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"><Avatar name={user.name} className="h-9 w-9 text-xs" /></Link>
                <button className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-600/10 sm:block" onClick={() => { logout(); nav('/login') }}>Sign out</button>
              </>
            ) : <Link to="/login" className="btn-outline px-4 py-2">Sign in</Link>}
            <button type="button" className="rounded-xl p-2 md:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobile" className="mt-3 grid animate-fade-up gap-1 border-t border-slate-200 pt-3 md:hidden">
            {items.map((i) => <NavLink key={i.to} to={i.to} end={i.to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-teal-600/10 text-teal-700' : 'text-slate-600'}`}>{i.label}</NavLink>)}
            {user && <><NavLink to="/profile" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600">My profile</NavLink>
              <button className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600" onClick={() => { setOpen(false); logout(); nav('/login') }}>Sign out</button></>}
          </nav>
        )}
      </div>
    </header>
  )
}