import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import { useCountUp } from '../hooks'
import { getHospitalImage } from '../lib/images'
import { provinceOf } from '../lib/provinces'
import { DoctorIllustration } from '../components/DoctorIllustration.jsx'
import HospitalCard from '../components/HospitalCard.jsx'
import SpecIcon from '../components/SpecIcon.jsx'

const Stat = ({ value, suffix = '', label }) => { const n = useCountUp(value); return <div className="text-center"><p className="text-3xl font-extrabold tabular-nums text-teal-700">{n}{suffix}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div> }

const Ico = ({ d }) => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
const ICONS = {
  book: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18M12 14v4M10 16h4" /></>,
  ticket: <path d="M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 8v10" strokeDasharray="2 3" />,
  pill: <><rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="M10.5 7.5l6 6" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  card: <><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  access: <><circle cx="12" cy="4.5" r="1.8" /><path d="M12 8v6h5l2.5 5M12 11h4.5M7.5 12.5a5 5 0 1 0 7 6.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
}

export default function Home() {
  const { user } = useAuth(); const nav = useNavigate()
  const [hospitals, setHospitals] = useState(null)
  const [hid, setHid] = useState(''); const [spec, setSpec] = useState('')
  const widget = useRef(null); const rail = useRef(null)

  useEffect(() => { api('/hospitals').then(setHospitals).catch(() => setHospitals([])) }, [])
  const specs = [...new Set((hospitals || []).flatMap((h) => h.specializations))].sort()
  const options = (hospitals || []).filter((h) => h.specializations.length && (!spec || h.specializations.includes(spec)))
  const hosp = hospitals?.find((h) => h.id === hid)
  const find = (e) => { e.preventDefault(); nav(`/book${hid ? `?hospital=${hid}${spec ? `&spec=${encodeURIComponent(spec)}` : ''}` : ''}`) }
  const pickSpec = (s) => { setSpec(s); setHid(''); widget.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
  const scrollRail = (d) => rail.current?.scrollBy({ left: d * 300, behavior: 'smooth' })

  const quick = [
    { to: '/book', icon: 'book', t: 'Book a doctor', d: 'Pick a hospital, specialty and doctor.' },
    { to: user ? '/appointments' : '/login', icon: 'ticket', t: user ? 'My tickets' : 'Sign in', d: user ? 'See where you are in line, live.' : 'Sign in to see your tickets.' },
    { to: '/medicine', icon: 'pill', t: 'Find medicine', d: 'Check which pharmacy has it in stock.' },
    { to: '/contact', icon: 'bell', t: 'Get help', d: 'Questions, feedback or partnerships.' },
  ]
  const steps = [['1', 'Choose', 'Pick your hospital, specialty and doctor.'], ['2', 'Reserve and pay', 'Get the next token. Pay by card, Apple Pay or at the counter.'], ['3', 'Arrive on time', "Watch your place in line and get an alert when you're 5 away."]]
  const why = [
    ['clock', 'Live queue', 'See who is being seen now and how many are ahead of you, updated every few seconds.'], ['bell', 'Turn alerts', 'A nudge when about 5 patients are left, so you arrive just in time.'],
    ['card', 'Flexible payment', 'Card, Apple Pay (demo) or pay at the counter. Your token is held for 10 minutes while you pay.'], ['pill', 'Medicine finder', 'Search by brand, generic name or even a misspelling.'],
    ['access', 'Built for everyone', 'Bigger text, colour-blind mode, read-aloud and more, from the button at the bottom left.'], ['lock', 'Privacy first', 'Booking records, including your phone number, are deleted automatically after the clinic day.'],
  ]

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-600 via-teal-600 to-teal-700 p-6 text-white shadow-lift sm:p-10">
        <span aria-hidden="true" className="absolute -right-16 -top-16 h-72 w-72 animate-float rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute bottom-0 left-1/3 h-40 w-40 animate-float rounded-full bg-sage-300/20 [animation-delay:2s]" />
        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><i className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />Live queues in Sri Lanka</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Your Health,<br />Our Priority</h1>
            <p className="mt-3 max-w-md text-teal-50">Compassionate care for you and your family. Book a doctor, get a live token, and skip the waiting room.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link to="/book" className="btn bg-white px-6 py-3 text-teal-700 hover:bg-teal-50">Book appointment</Link><Link to="/medicine" className="btn border border-white/60 px-6 py-3 text-white hover:bg-white/10">Find medicine</Link></div>
          </div>
          <div className="relative mx-auto w-full max-w-xs">
            <DoctorIllustration className="w-full" />
            <span className="absolute -left-4 top-10 animate-float rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lift">Token <span className="text-emerald-600">#6</span> confirmed</span>
            <span className="absolute -right-2 bottom-16 animate-float rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lift [animation-delay:1.5s]">5 ahead · head over now</span>
          </div>
        </div>
        <form ref={widget} onSubmit={find} className="glass relative mt-8 grid gap-3 rounded-2xl p-4 text-slate-800 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div><label htmlFor="hs" className="label">Specialty</label><select id="hs" className="input" value={spec} onChange={(e) => { setSpec(e.target.value); setHid('') }}><option value="">Any specialty</option>{specs.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label htmlFor="hh" className="label">Hospital</label><select id="hh" className="input" value={hid} onChange={(e) => setHid(e.target.value)}><option value="">Choose a hospital</option>{options.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
          <button className="btn-confirm py-3">Find doctors</button>
        </form>
      </section>

      <section aria-label="Key facts" className="card -mt-10 mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={hospitals?.length || 0} label="Hospitals" /><Stat value={specs.length} label="Specialties" /><Stat value={10} suffix=" min" label="Token held while you pay" /><Stat value={5} label="Ahead when we alert you" />
      </section>

      <section aria-labelledby="qa">
        <h2 id="qa" className="mb-4 text-xl font-extrabold">Quick access</h2>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.t} to={q.to} className="card group hover:-translate-y-1 hover:border-teal-600 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white"><Ico d={ICONS[q.icon]} /></span>
              <p className="mt-3 font-bold">{q.t}</p><p className="text-sm text-slate-500">{q.d}</p>
              <span aria-hidden="true" className="mt-2 inline-block text-teal-700 transition group-hover:translate-x-1">→</span>
            </Link>))}
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="mb-4 text-xl font-extrabold">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <li key={n} className="card relative hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-lg font-extrabold text-white">{n}</span>
              <p className="mt-3 font-bold">{t}</p><p className="text-sm text-slate-500">{d}</p>
            </li>))}
        </ol>
      </section>

      {specs.length > 0 && (
        <section aria-labelledby="dep">
          <h2 id="dep" className="mb-1 text-xl font-extrabold">Our departments</h2><p className="mb-4 text-sm text-slate-500">Tap one to start a search.</p>
          <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {specs.slice(0, 8).map((s) => (
              <button key={s} type="button" onClick={() => pickSpec(s)} aria-pressed={spec === s} className={`card group flex flex-col items-center gap-2 py-5 hover:-translate-y-1 hover:shadow-lift ${spec === s ? 'border-teal-600 ring-2 ring-teal-600/25' : ''}`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition group-hover:scale-110"><SpecIcon name={s} className="h-6 w-6" /></span>
                <span className="text-center text-sm font-bold">{s}</span>
              </button>))}
          </div>
        </section>
      )}

      {hospitals?.length > 0 && (
        <section aria-labelledby="fh">
          <div className="mb-4 flex items-end justify-between"><h2 id="fh" className="text-xl font-extrabold">Hospitals you can book</h2>
            <div className="flex gap-2"><button type="button" aria-label="Scroll left" onClick={() => scrollRail(-1)} className="btn-outline h-10 w-10 p-0">‹</button><button type="button" aria-label="Scroll right" onClick={() => scrollRail(1)} className="btn-outline h-10 w-10 p-0">›</button></div></div>
          <div ref={rail} className="flex snap-x gap-4 overflow-x-auto pb-4">
            {hospitals.map((h) => <div key={h.id} className="w-72 shrink-0 snap-start"><HospitalCard h={h} province={provinceOf(h)} image={getHospitalImage(h.id)} onSelect={() => nav(`/book?hospital=${h.id}`)} /></div>)}
          </div>
        </section>
      )}

      <section aria-labelledby="why">
        <h2 id="why" className="mb-4 text-xl font-extrabold">Why CareQueue</h2>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(([i, t, d]) => (
            <div key={t} className="card hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><Ico d={ICONS[i]} /></span>
              <p className="mt-3 font-bold">{t}</p><p className="text-sm text-slate-500">{d}</p>
            </div>))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-sage-700 p-8 text-center text-white">
        <span aria-hidden="true" className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <h2 className="relative text-2xl font-extrabold">Ready to skip the waiting room?</h2><p className="relative mt-1 text-sage-100">It takes about a minute to book.</p>
        <div className="relative mt-5 flex flex-wrap justify-center gap-3"><Link to="/book" className="btn bg-white px-6 py-3 text-sage-700 hover:bg-sage-50">Book appointment</Link>{!user && <Link to="/register" className="btn border border-white/60 px-6 py-3 text-white hover:bg-white/10">Create account</Link>}</div>
      </section>
    </div>
  )
}