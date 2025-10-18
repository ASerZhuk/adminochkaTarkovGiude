import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f17',
        card: '#121826',
        primary: '#4f46e5',
        muted: '#94a3b8'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
} satisfies Config

