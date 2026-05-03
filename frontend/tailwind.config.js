/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        accent: {
          pink: '#ec4899',
          neon: '#10b981',
          gold: '#f59e0b',
        }
      },
      backgroundImage: {
        'fitness-pattern': "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
