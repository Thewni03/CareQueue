import { Link } from 'react-router-dom'
import { useCountUp } from '../hooks'
import { Avatar } from '../components/ui.jsx'

const TEAM = [

]
const VALUES = [['Your time matters', 'Waiting should not mean sitting in a crowded room with no idea when your turn is.'], ['Clear and honest', 'Live information, simple prices, and no surprises when you pay.'], ['Open to everyone', 'Large text, colour-blind mode, read-aloud and keyboard support are built in.'], ['Privacy by design', 'We keep booking data only as long as it is needed, then it is deleted.']]

export default function About() {
  const pct = useCountUp(68)
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-600 to-teal-700 p-8 text-white shadow-lift sm:p-12">
        <span aria-hidden="true" className="absolute -right-12 -top-12 h-56 w-56 animate-float rounded-full bg-white/10" />
        <p className="relative text-sm font-semibold text-sage-100">About us</p>
        <h1 className="relative mt-1 max-w-xl text-4xl font-extrabold leading-tight">Healthcare should not start with hours of waiting.</h1>
        <p className="relative mt-3 max-w-xl text-sage-50">CareQueue lets patients book a doctor, follow their place in line from anywhere, and find the medicine they need without walking from pharmacy to pharmacy.</p>
      </section>

      <section aria-labelledby="prob" className="grid items-center gap-6 md:grid-cols-2">
        <div><h2 id="prob" className="text-2xl font-extrabold">The problem we saw</h2>
          <p className="mt-2 text-slate-600">In Sri Lankan hospitals and channeling clinics, patients wait for hours with no view of the queue. When a medicine is urgent, they visit one pharmacy after another to find it in stock.</p>
          <p className="mt-2 text-slate-600">We built CareQueue to give that time back.</p></div>
        <div className="card text-center"><p className="text-6xl font-extrabold tabular-nums text-teal-700">{pct}%</p>
          <p className="mt-1 text-sm text-slate-600">of the 25 people we surveyed said wasting time sitting and waiting was their biggest problem when visiting a hospital or buying medicine.</p>
          <p className="mt-2 text-xs text-slate-500"></p></div>
      </section>

      <section aria-labelledby="val">
        <h2 id="val" className="mb-4 text-2xl font-extrabold">What we stand for</h2>
        <div className="stagger grid gap-4 sm:grid-cols-2">{VALUES.map(([t, d]) => <div key={t} className="card hover:-translate-y-1 hover:shadow-lift"><p className="font-bold text-teal-700">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      </section>

      <section aria-labelledby="team">
        <h2 id="team" className="mb-1 text-2xl font-extrabold">Our Mission</h2><p className="mb-4 text-xl text-slate-600">To eliminate wasted waiting hours and stockout anxiety by creating a unified, real-time healthcare access network across Sri Lanka.</p>
        <div className="stagger grid gap-4 sm:grid-cols-3">
          {TEAM.map(([n, r, d]) => (
            <div key={n} className="card group text-center hover:-translate-y-1 hover:shadow-lift">
              <Avatar name={n} className="mx-auto h-16 w-16 text-xl transition group-hover:scale-110" /><p className="mt-3 font-bold">{n}</p><p className="text-sm font-semibold text-teal-700">{r}</p><p className="mt-1 text-sm text-slate-500">{d}</p>
            </div>))}
        </div>
      </section>

    

      <div className="text-center"><Link to="/book" className="btn-confirm px-8 py-3">Book your first appointment</Link></div>
    </div>
  )
}