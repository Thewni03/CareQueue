import { DoctorIllustration, Plant, Sparkle } from './DoctorIllustration.jsx'

/** Card on the left (with a medical-cross badge and a plant), friendly doctor on the right. */
export default function AuthShell({ children }) {
  return (
    <div className="mx-auto grid max-w-4xl items-center gap-4 py-4 md:grid-cols-2">
      <div className="relative order-2 md:order-1">
        <span className="absolute -left-3 -top-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl border-[3px] bg-sage-300 shadow ink-border" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </span>
        <div className="rounded-[2rem] border-[3px] bg-white p-6 pt-8 shadow-soft ink-border">{children}</div>
        <Plant className="pointer-events-none absolute -bottom-6 -left-8 hidden h-24 w-20 md:block" />
      </div>
      <div className="relative order-1 mx-auto w-full max-w-xs md:order-2 md:-ml-10 md:max-w-sm">
        <Sparkle className="absolute -top-2 left-4 h-8 w-8" /><Sparkle className="absolute right-0 top-20 h-5 w-5 [animation-delay:1.2s]" />
        <DoctorIllustration className="w-full" />
      </div>
    </div>
  )
}