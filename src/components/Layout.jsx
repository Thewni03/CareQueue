import { Outlet, useLocation } from 'react-router-dom'
import DateTimeBoard from './DateTimeBoard.jsx'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

export default function Layout() {
  const loc = useLocation()
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only rounded-full bg-white px-4 py-2 font-semibold text-teal-700 focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80]">Skip to content</a>
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6 outline-none">
        <div key={loc.pathname} className="animate-fade-up"><Outlet /></div>
      </main>
      <Footer />
      <DateTimeBoard />
    </div>
  )
}