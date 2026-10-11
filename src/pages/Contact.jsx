import { useState } from 'react'

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'carequeue.sl@gmail.com'
const FAQ = [
  ['How do I know when to leave home?', "Book a token, then open My tickets. You'll see how many patients are ahead and an estimated wait. We nudge you when about 5 are left."],
  ['What happens if I do not pay in time?', 'Your token is held for 10 minutes. If payment is not finished, the token is released so someone else can use it.'],
  ['Can I pay at the hospital?', 'Yes. Choose Pay at counter, keep your token, and pay at the clinic desk when you arrive.'],
  ['How does medicine search work?', 'Type a brand name, a generic name or your best spelling. We check which nearby pharmacies have it in stock.'],
  ['What do you do with my data?', 'Booking records, including your phone number, are deleted automatically after the clinic day. Card details are never stored in full.'],
]

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', topic: 'General question', message: '' })
  const [open, setOpen] = useState(0)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const send = (e) => {
    e.preventDefault()
    const body = `${f.message}\n\nFrom: ${f.name} (${f.email})`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('[CareQueue] ' + f.topic)}&body=${encodeURIComponent(body)}`
  }
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white shadow-lift sm:p-10">
        <p className="text-sm font-semibold text-teal-50">Contact us</p><h1 className="mt-1 text-4xl font-extrabold">We'd love to hear from you</h1>
        <p className="mt-2 max-w-lg text-teal-50">Questions, feedback, or want to bring your hospital or pharmacy onto CareQueue? Send us a message.</p>
      </section>

      <div className="grid items-start gap-6 md:grid-cols-5">
        <form onSubmit={send} className="card space-y-3 md:col-span-3">
          <h2 className="text-lg font-bold text-teal-700">Send a message</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="cn">Your name</label><input id="cn" required className="input" value={f.name} onChange={set('name')} /></div>
            <div><label className="label" htmlFor="ce">Your email</label><input id="ce" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
          </div>
          <div><label className="label" htmlFor="ct">Topic</label><select id="ct" className="input" value={f.topic} onChange={set('topic')}>{['General question', 'Hospital or pharmacy partnership', 'Report a problem', 'Feedback'].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label" htmlFor="cm">Message</label><textarea id="cm" required rows={5} className="input" value={f.message} onChange={set('message')} /></div>
          <button className="btn-confirm w-full py-3">Open in my email app</button>
          <p className="text-xs text-slate-500">This opens your email app with the message ready to send to {EMAIL}.</p>
        </form>

        <div className="space-y-4 md:col-span-2">
          {[['Email', EMAIL, `mailto:${EMAIL}`], ['For hospitals and pharmacies', 'Ask us about joining CareQueue', `mailto:${EMAIL}?subject=${encodeURIComponent('[CareQueue] Partnership')}`]].map(([t, d, h]) => (
            <a key={t} href={h} className="card group block hover:-translate-y-1 hover:border-teal-600 hover:shadow-lift"><p className="text-sm font-semibold text-slate-500">{t}</p><p className="font-bold text-teal-700 group-hover:underline">{d}</p></a>))}
          <div className="card"><p className="text-sm font-semibold text-slate-500">Built by</p><p className="font-bold">Team Terminal</p><p className="text-sm text-slate-500">IntelliCon '26 Buildathon</p></div>
        </div>
      </div>

      <section aria-labelledby="faq">
        <h2 id="faq" className="mb-3 text-2xl font-extrabold">Frequently asked</h2>
        <div className="space-y-3">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="card p-0">
              <button type="button" className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-bold" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {q}<span aria-hidden="true" className={`text-xl text-teal-700 transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && <p className="animate-fade-up px-5 pb-4 text-sm text-slate-600">{a}</p>}
            </div>))}
        </div>
      </section>
    </div>
  )
}