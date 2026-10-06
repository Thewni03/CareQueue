import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const tab = ({ isActive }) =>
  `whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'border-white text-white' : 'border-transparent text-teal-100 hover:text-white'}`

export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate()
  const role = user?.role
  const patientish = !role || role === 'PATIENT'
  return (
    <div className="min-h-screen">
      <header className="bg-teal-600 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 pt-4">
          <h1 className="text-xl font-extrabold tracking-tight">CareQueue</h1>
          {user
            ? <button className="text-sm text-teal-50 underline-offset-2 hover:underline" onClick={() => { logout(); nav('/login') }}>Sign out ({user.name.split(' ')[0]})</button>
            : <NavLink to="/login" className="text-sm font-semibold underline-offset-2 hover:underline">Sign in</NavLink>}
        </div>
        <nav className="mx-auto flex max-w-4xl overflow-x-auto px-2">
          {patientish && <><NavLink to="/book" className={tab}>Book a doctor</NavLink>{user && <NavLink to="/appointments" className={tab}>My tickets</NavLink>}<NavLink to="/medicine" className={tab}>Find medicine</NavLink></>}
          {role === 'HOSPITAL' && <><NavLink to="/counter" className={tab}>Live counter</NavLink><NavLink to="/schedule" className={tab}>Doctors & sessions</NavLink></>}
          {role === 'PHARMACY' && <NavLink to="/stock" className={tab}>Stock</NavLink>}
          {role === 'ADMIN' && <NavLink to="/admin" className={tab}>Console</NavLink>}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6"><Outlet /></main>
    </div>
  )
}
