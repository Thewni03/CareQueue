import { Link } from 'react-router-dom'
import { Logo } from './Navbar.jsx'

export default function Footer() {
  return (
    <footer className="mx-auto mt-10 max-w-5xl px-4 pb-24">
      <div className="card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div><Logo /><p className="mt-2 text-sm text-slate-500">Your health, our priority.</p></div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
          <Link to="/book" className="hover:text-teal-700">Book a doctor</Link><Link to="/medicine" className="hover:text-teal-700">Find medicine</Link>
          <Link to="/about" className="hover:text-teal-700">About us</Link><Link to="/contact" className="hover:text-teal-700">Contact us</Link>
        </nav>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">CareQueue is a prototype built by Team Terminal for IntelliCon '26. Hospitals, doctors and pharmacies shown are demo data.</p>
    </footer>
  )
}