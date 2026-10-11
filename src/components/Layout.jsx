import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { Avatar } from './ui.jsx'

const tab = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-teal-700 shadow' : 'text-teal-50 hover:bg-white/15'}`

const Logo = () => (
  <span className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </span>
    <span className="text-xl font-extrabold tracking-tight">CareQueue</span>
  </span>
)

export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const loc = useLocation()
  const role = user?.role
  const patientish = !role || role === 'PATIENT'
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only rounded-full bg-white px-4 py-2 font-semibold text-teal-700 focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80]">Skip to content</a>
      <header className="rounded-b-[2rem] bg-gradient-to-b from-teal-600 to-teal-700 pb-4 text-white shadow-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 pt-4">
          <Logo />
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar name={user.name} className="h-8 w-8 bg-white/20 text-xs" />
              <button className="rounded-full px-3 py-1.5 text-sm font-semibold text-teal-50 transition hover:bg-white/15" onClick={() => { logout(); nav('/login') }}>Sign out</button>
            </div>
          ) : <NavLink to="/login" className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-teal-700 transition hover:shadow-md">Sign in</NavLink>}
        </div>
        <nav aria-label="Main" className="mx-auto mt-3 flex max-w-4xl gap-1 overflow-x-auto px-3">
          {patientish && <><NavLink to="/book" className={tab}>Book a doctor</NavLink>{user && <NavLink to="/appointments" className={tab}>My tickets</NavLink>}<NavLink to="/medicine" className={tab}>Find medicine</NavLink></>}
          {role === 'HOSPITAL' && <><NavLink to="/counter" className={tab}>Live counter</NavLink><NavLink to="/schedule" className={tab}>Doctors & sessions</NavLink></>}
          {role === 'PHARMACY' && <NavLink to="/stock" className={tab}>Stock</NavLink>}
          {role === 'ADMIN' && <NavLink to="/admin" className={tab}>Console</NavLink>}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-6 outline-none">
        <div key={loc.pathname} className="animate-fade-up"><Outlet /></div>
      </main>
    </div>
  )
}