/** Palette: teal-600 primary, slate-600 secondary, slate-50 canvas, white surface,
 *  emerald-600 confirm, teal-600 search/track, red-600 alert, blue-600 counter. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      keyframes: {
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(5,150,105,.55)' }, '70%': { boxShadow: '0 0 0 10px rgba(5,150,105,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(5,150,105,0)' } },
        ticketIn: { '0%': { opacity: 0, transform: 'translateY(-18px) rotate(-1.5deg)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(0)' }, '100%': { transform: 'scale(1)' } },
        scan: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(56px)' } },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.6s ease-out infinite',
        'ticket-in': 'ticketIn .5s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .25s ease-out both',
        scan: 'scan .9s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
