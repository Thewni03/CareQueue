/** Palette: teal-600 primary, slate-600 secondary, slate-50 canvas, white surface,
 *  emerald-600 confirm, teal-600 search/track, red-600 alert, blue-600 counter. */
 export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 6px 24px rgba(15, 118, 110, 0.08)',
        lift: '0 16px 40px rgba(15, 118, 110, 0.20)',
      },
      keyframes: {
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(5,150,105,.55)' }, '70%': { boxShadow: '0 0 0 10px rgba(5,150,105,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(5,150,105,0)' } },
        ticketIn: { '0%': { opacity: 0, transform: 'translateY(-18px) rotate(-1.5deg)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(0)' }, '70%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        scan: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(56px)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        draw: { '0%': { strokeDashoffset: 60 }, '100%': { strokeDashoffset: 0 } },
        confetti: { '0%': { transform: 'translate(0,0) rotate(0deg)', opacity: 1 }, '100%': { transform: 'translate(var(--x), var(--y)) rotate(var(--r))', opacity: 0 } },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.6s ease-out infinite',
        'ticket-in': 'ticketIn .6s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .35s ease-out both',
        scan: 'scan .9s ease-in-out infinite alternate',
        float: 'float 7s ease-in-out infinite',
        bob: 'bob 2.4s ease-in-out infinite',
        'fade-up': 'fadeUp .45s ease-out both',
        draw: 'draw .6s .2s ease-out both',
        confetti: 'confetti 1.6s ease-out both',
      },
    },
  },
  plugins: [],
}