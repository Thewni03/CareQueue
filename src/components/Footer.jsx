import { Link } from 'react-router-dom'
import { Logo } from './Navbar.jsx'

// Point these at your real pages before publishing.
const SOCIAL = [
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></> },
  { name: 'Facebook', href: 'https://www.facebook.com/', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  { name: 'Twitter', href: 'https://twitter.com/', icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /> },
]
const LINKS = [['/book', 'Book a doctor'], ['/medicine', 'Find medicine'], ['/about', 'About us'], ['/contact', 'Contact us']]

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-slate-500">Your health, our priority. Book a doctor, skip the waiting room and find your medicine.</p>
          <div className="mt-4 flex gap-3">
            {SOCIAL.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`CareQueue on ${s.name} (opens in a new tab)`} title={s.name}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:-translate-y-1 hover:border-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
              </a>))}
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 content-start gap-x-8 gap-y-3 text-sm font-semibold text-slate-600 md:justify-self-end">
          {LINKS.map(([to, label]) => <Link key={to} to={to} className="transition hover:translate-x-1 hover:text-teal-700">{label}</Link>)}
        </nav>
      </div>
      <div className="border-t border-slate-100">
   
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 pb-24 pt-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:pb-4 md:pr-56">
          <p className="font-semibold">© {new Date().getFullYear()} CareQueue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}