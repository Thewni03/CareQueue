import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const Ctx = createContext({ theme: 'light', toggle: () => {} })
export const useTheme = () => useContext(Ctx)

const initial = () => {
  try { const t = localStorage.getItem('theme'); if (t) return t } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initial)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  /** Switches theme with a circular reveal that grows from the toggle button (where the browser supports it). */
  const toggle = useCallback((e) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('a11y-motion')
    if (!document.startViewTransition || still) { setTheme(next); return }
    const r = e?.currentTarget?.getBoundingClientRect?.()
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2, y = r ? r.top + r.height / 2 : 0
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const t = document.startViewTransition(() => { root.classList.toggle('dark', next === 'dark'); setTheme(next) })
    t.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' })).catch(() => {})
  }, [theme])

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}
