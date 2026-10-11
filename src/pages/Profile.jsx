import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth, homeFor } from '../auth.jsx'
import { usePoll } from '../hooks'
import { getAvatar, fileToDataUrl, setAvatar } from '../lib/images'
import { dayLabel, time12 } from '../fmt'
import BodyXray from '../components/BodyXray.jsx'
import Calendar from '../components/Calendar.jsx'
import { Avatar, ErrorNote } from '../components/ui.jsx'

const ROLE = { PATIENT: 'Patient', HOSPITAL: 'Hospital desk', PHARMACY: 'Pharmacy', ADMIN: 'Administrator' }
const focusOf = (spec = '') => { const s = spec.toLowerCase()
  return s.includes('cardio') ? 'heart' : s.includes('ent') ? 'head' : s.includes('ortho') ? 'spine' : s.includes('derma') ? 'skin' : null }

function Clock() {
  const [n, setN] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setN(new Date()), 1000); return () => clearInterval(t) }, [])
  return <p className="text-4xl font-extrabold tabular-nums">{String(n.getHours()).padStart(2, '0')}:{String(n.getMinutes()).padStart(2, '0')}<span className="text-lg text-slate-500">:{String(n.getSeconds()).padStart(2, '0')}</span></p>
}

export default function Profile() {
  const { user } = useAuth()
  const [list, setList] = useState([]); const [day, setDay] = useState(null); const [error, setError] = useState('')
  const [photo, setPhoto] = useState(() => getAvatar(user.id)); const file = useRef(null)
  const patient = user.role === 'PATIENT'
  usePoll(() => patient && api('/appointments/mine').then(setList).catch((e) => setError(e.message)), 10000, [patient])

  const live = list.filter((t) => t.appointment.status === 'BOOKED' || t.appointment.status === 'HELD')
  const marked = {}; live.forEach((t) => { (marked[t.appointment.date] ||= []).push(t) })
  const next = [...live].sort((a, b) => (a.appointment.date + a.appointment.startTime).localeCompare(b.appointment.date + b.appointment.startTime))[0]
  const dayList = day ? marked[day] || [] : []

  const upload = async (e) => {
    try { const url = await fileToDataUrl(e.target.files[0], 300); if (!setAvatar(user.id, url)) throw new Error('Not enough browser storage for that photo.'); setPhoto(url) } catch (x) { setError(x.message) }
  }
  const first = user.name.split(' ')[0]

  return (
    <div className="space-y-5">
      <ErrorNote>{error}</ErrorNote>
      <section className="card flex flex-wrap items-center gap-5">
        <div className="relative">
          {photo ? <img src={photo} alt="" className="h-20 w-20 rounded-full object-cover" /> : <Avatar name={user.name} className="h-20 w-20 text-2xl" />}
          <button type="button" onClick={() => file.current?.click()} aria-label="Change profile photo" className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow transition hover:scale-110">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg></button>
          <input ref={file} type="file" accept="image/*" className="hidden" onChange={upload} />
        </div>
        <div className="min-w-0 flex-1"><h1 className="text-3xl font-extrabold">Hi, {first}</h1>
          <p className="truncate text-sm text-slate-500">{user.email}</p><span className="mt-1 inline-block rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-teal-700">{ROLE[user.role]}</span></div>
        <Clock />
      </section>
      <p className="-mt-3 text-xs text-slate-500">Your profile photo is saved on this device only.</p>

      <div className="grid items-start gap-5 md:grid-cols-5">
        {patient ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-teal-950 p-5 text-white shadow-lift md:col-span-2" aria-label="Health overview">
            <p className="text-sm font-semibold text-teal-200">{next ? 'Next visit' : 'Health overview'}</p>
            <div className="h-80"><BodyXray focus={focusOf(next?.appointment.specialization)} /></div>
            {next ? (
              <div className="rounded-2xl bg-white/10 p-3 text-sm backdrop-blur"><p className="font-bold">{next.appointment.doctorName}</p><p className="text-teal-100">{next.appointment.specialization} · {next.appointment.hospitalName}</p>
                <p className="mt-1 text-teal-100">{dayLabel(next.appointment.date)}, {time12(next.appointment.startTime)} · Token <b className="text-white">#{next.appointment.tokenNumber}</b></p></div>
            ) : <div className="rounded-2xl bg-white/10 p-3 text-center text-sm backdrop-blur"><p className="text-teal-100">No appointments yet.</p><Link to="/book" className="btn-confirm mt-2 px-5 py-2">Book a doctor</Link></div>}
          </section>
        ) : (
          <section className="card md:col-span-2"><h2 className="font-bold text-teal-700">Your workspace</h2><p className="mt-1 text-sm text-slate-600">Signed in as {ROLE[user.role].toLowerCase()}.</p><Link to={homeFor(user.role)} className="btn-teal mt-4">Open my dashboard</Link></section>
        )}

        <section className="card md:col-span-3">
          <h2 className="mb-3 font-bold text-teal-700">Calendar</h2>
          <Calendar marked={marked} selected={day} onSelect={(k) => setDay(day === k ? null : k)} />
          {patient && day && (
            <div className="mt-4 animate-fade-up border-t border-slate-200 pt-3">
              <p className="text-sm font-bold">{dayLabel(day)}</p>
              {dayList.length === 0 ? <p className="text-sm text-slate-500">No appointments on this day.</p> : dayList.map((t) => (
                <p key={t.appointment.id} className="mt-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm"><b>{t.appointment.doctorName}</b> · {time12(t.appointment.startTime)} · Token #{t.appointment.tokenNumber}</p>))}
            </div>)}
        </section>
      </div>
    </div>
  )
}