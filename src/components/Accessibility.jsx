import { useEffect, useRef, useState } from 'react'

const KEY = 'a11y-settings'
const SIZES = [100, 115, 130, 150, 175]
const DEFAULTS = { size: 100, font: false, spacing: false, contrast: false, cb: false, gray: false, motion: false, links: false, focus: false, cursor: false, guide: false }
// setting -> class added to <html>; the matching CSS lives in index.css
const CLASS = { font: 'a11y-font', spacing: 'a11y-spacing', contrast: 'a11y-contrast', cb: 'cb-safe', gray: 'a11y-gray', motion: 'a11y-motion', links: 'a11y-links', focus: 'a11y-focus', cursor: 'a11y-cursor' }

const PRESETS = [
  { name: 'Low vision', set: { size: 150, contrast: true, font: true, focus: true } },
  { name: 'Colour blind', set: { cb: true } },
  { name: 'Dyslexia', set: { font: true, spacing: true, guide: true } },
  { name: 'Motion sensitive', set: { motion: true } },
]

const load = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return DEFAULTS } }

const WheelchairIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4.5" r="1.8" fill="currentColor" stroke="none" /><path d="M12 8v6h5l2.5 5" /><path d="M12 11h4.5" /><path d="M7.5 12.5a5 5 0 1 0 7 6.5" />
  </svg>
)

function Switch({ label, hint, on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
      <span><span className="block text-sm font-semibold text-slate-800">{label}</span>{hint && <span className="block text-xs text-slate-500">{hint}</span>}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="w-7 text-right text-xs font-bold text-slate-600">{on ? 'On' : 'Off'}</span>
        <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-teal-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        </span>
      </span>
    </button>
  )
}

export default function Accessibility() {
  const [open, setOpen] = useState(false)
  const [s, setS] = useState(load)
  const [speaking, setSpeaking] = useState(false)
  const [y, setY] = useState(-200)
  const panel = useRef(null), btn = useRef(null)

  // apply settings to <html> and remember them
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${s.size}%`
    Object.entries(CLASS).forEach(([k, c]) => root.classList.toggle(c, !!s[k]))
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
  }, [s])

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector('button')?.focus()
    const k = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open])

  useEffect(() => {
    if (!s.guide) return
    const m = (e) => setY(e.clientY)
    window.addEventListener('mousemove', m); return () => window.removeEventListener('mousemove', m)
  }, [s.guide])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const set = (patch) => setS((p) => ({ ...p, ...patch }))
  const toggle = (k) => setS((p) => ({ ...p, [k]: !p[k] }))
  const bump = (d) => { const i = SIZES.indexOf(s.size); set({ size: SIZES[Math.min(SIZES.length - 1, Math.max(0, i + d))] }) }
  const applyPreset = (p) => setS({ ...DEFAULTS, ...p.set })
  const reset = () => { window.speechSynthesis?.cancel(); setSpeaking(false); setS(DEFAULTS) }

  const read = () => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    const text = window.getSelection()?.toString().trim() || document.getElementById('main')?.innerText || ''
    if (!text) return
    const u = new SpeechSynthesisUtterance(text)
    u.onend = u.onerror = () => setSpeaking(false)
    synth.cancel(); synth.speak(u); setSpeaking(true)
  }

  const changed = JSON.stringify(s) !== JSON.stringify(DEFAULTS)

  return (
    <>
      {s.guide && (
        <>
          <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[65] bg-slate-900/55" style={{ height: Math.max(0, y - 28) }} />
          <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] bg-slate-900/55" style={{ top: y + 28 }} />
        </>
      )}

      <button ref={btn} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="a11y-panel" aria-label="Accessibility settings"
        className="fixed bottom-4 left-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lift ring-4 ring-white transition hover:scale-110 hover:bg-teal-700 focus:outline-none focus-visible:ring-amber-400">
        <WheelchairIcon />
        {changed && <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" aria-label="Some settings are on" />}
      </button>

      {open && (
        <div ref={panel} id="a11y-panel" role="dialog" aria-label="Accessibility settings"
          className="fixed bottom-24 left-4 z-[70] flex max-h-[78vh] w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-up flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lift">
          <div className="flex items-center justify-between bg-teal-600 px-4 py-3 text-white">
            <h2 className="font-bold">Accessibility</h2>
            <button type="button" onClick={() => { setOpen(false); btn.current?.focus() }} className="rounded-full px-3 py-1 text-sm font-semibold hover:bg-white/15" aria-label="Close accessibility settings">Close</button>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            <section aria-label="Quick profiles">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Quick profiles</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => <button key={p.name} type="button" onClick={() => applyPreset(p)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700">{p.name}</button>)}
              </div>
            </section>

            <section aria-label="Text size">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Text size · {s.size}%</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => bump(-1)} disabled={s.size === SIZES[0]} aria-label="Smaller text" className="btn-outline px-4 py-2 text-sm">A−</button>
                <div className="flex flex-1 justify-center gap-1.5" aria-hidden="true">{SIZES.map((z) => <span key={z} className={`h-2.5 rounded-full transition-all ${z <= s.size ? 'w-5 bg-teal-600' : 'w-2.5 bg-slate-200'}`} />)}</div>
                <button type="button" onClick={() => bump(1)} disabled={s.size === SIZES[SIZES.length - 1]} aria-label="Larger text" className="btn-outline px-4 py-2 text-base font-bold">A+</button>
              </div>
            </section>

            <section aria-label="Reading">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Reading</p>
              <Switch label="Easy-read font" hint="Clear, distinct letter shapes" on={s.font} onChange={() => toggle('font')} />
              <Switch label="Wider spacing" hint="More space between letters and lines" on={s.spacing} onChange={() => toggle('spacing')} />
              <Switch label="Reading guide" hint="Dims everything except the line you're on" on={s.guide} onChange={() => toggle('guide')} />
              <button type="button" onClick={read} className={`mx-3 mt-1 w-[calc(100%-1.5rem)] ${speaking ? 'btn-danger' : 'btn-teal'}`}>{speaking ? 'Stop reading' : 'Read this page aloud'}</button>
              <p className="mx-3 mt-1 text-xs text-slate-500">Select some text first to hear just that part.</p>
            </section>

            <section aria-label="Colour and contrast">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Colour and contrast</p>
              <Switch label="Colour-blind friendly" hint="Swaps red and green for blue and orange" on={s.cb} onChange={() => toggle('cb')} />
              <Switch label="High contrast" hint="Black text, strong borders, darker teal" on={s.contrast} onChange={() => toggle('contrast')} />
              <Switch label="Greyscale" hint="Removes all colour" on={s.gray} onChange={() => toggle('gray')} />
            </section>

            <section aria-label="Navigation and motion">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Navigation and motion</p>
              <Switch label="Highlight links and buttons" on={s.links} onChange={() => toggle('links')} />
              <Switch label="Strong focus outline" hint="For keyboard users" on={s.focus} onChange={() => toggle('focus')} />
              <Switch label="Large cursor" on={s.cursor} onChange={() => toggle('cursor')} />
              <Switch label="Stop animations" hint="No movement, flips or confetti" on={s.motion} onChange={() => toggle('motion')} />
            </section>

            <button type="button" onClick={reset} disabled={!changed} className="btn-outline w-full">Reset all settings</button>
          </div>
        </div>
      )}
    </>
  )
}
