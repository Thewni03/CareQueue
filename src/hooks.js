import { useEffect, useRef, useState } from 'react'

/** Runs fn now and every `ms` ms until unmount / deps change. */
export function usePoll(fn, ms, deps = []) {
  useEffect(() => {
    let alive = true
    const run = () => alive && fn()
    run(); const t = setInterval(run, ms)
    return () => { alive = false; clearInterval(t) }
    // eslint-disable-next-line
  }, deps)
}

export function useCountdown(until) {
  const calc = () => Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000))
  const [s, setS] = useState(calc)
  useEffect(() => { setS(calc()); const t = setInterval(() => setS(calc()), 1000); return () => clearInterval(t) }, [until])
  return s
}

/** Vibrates + shows a browser notification when a booked patient is within 5 of their turn. */
export function useAlerts(trackers) {
  const supported = typeof Notification !== 'undefined'
  const [perm, setPerm] = useState(supported ? Notification.permission : 'unsupported')
  const seen = useRef(new Set())
  useEffect(() => {
    trackers.forEach((t) => {
      const a = t.appointment
      if (a.status !== 'BOOKED' || a.tokenNumber <= t.nowServing || t.ahead > 5 || seen.current.has(a.id)) return
      seen.current.add(a.id)
      navigator.vibrate?.([200, 100, 200])
      if (perm === 'granted') new Notification('Your turn is near', { body: `${t.ahead === 0 ? "You're next" : t.ahead + ' ahead'} for ${a.doctorName}. Token #${a.tokenNumber}.` })
    })
  }, [trackers, perm])
  const enable = async () => { if (supported) setPerm(await Notification.requestPermission()) }
  return { perm, enable }
}

const reduced = () => typeof window !== 'undefined' &&
  (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion'))

/** Pointer-driven 3D tilt with a moving highlight. Spread the result on the element. */
export function useTilt(max = 6) {
  const ref = useRef(null)
  const onMouseMove = (e) => {
    const el = ref.current
    if (!el || reduced()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`)
    el.style.setProperty('--rx', `${-(y - 0.5) * max * 2}deg`)
    el.style.setProperty('--gx', `${x * 100}%`)
    el.style.setProperty('--gy', `${y * 100}%`)
  }
  const onMouseLeave = () => { ref.current?.style.setProperty('--rx', '0deg'); ref.current?.style.setProperty('--ry', '0deg') }
  return { ref, onMouseMove, onMouseLeave }
}

/** Counts up to `target` once it is known. */
export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (reduced()) { setV(target); return }
    let raf, start
    const step = (t) => {
      if (start === undefined) start = t
      const p = Math.min(1, (t - start) / ms)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}