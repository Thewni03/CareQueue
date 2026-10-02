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
