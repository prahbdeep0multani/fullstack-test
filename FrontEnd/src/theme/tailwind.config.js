/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--c-primary)',
        'primary-bg': 'var(--c-primary-bg)',
        secondary: 'rgba(0, 0, 0, 0.65)',
        // editorial tokens — theme-aware
        ink: 'var(--c-text)',
        'ink-2': 'var(--c-text-2)',
        'ink-3': 'var(--c-text-3)',
        edge: 'var(--c-border)',
        'edge-2': 'var(--c-border-2)',
        surface: 'var(--c-bg)',
        'surface-2': 'var(--c-bg-layout)',
        fill: 'var(--c-fill)',
        'fill-2': 'var(--c-fill-2)',
        // financial palette
        income: '#16a34a',
        expense: '#dc2626',
        'income-soft': '#22c55e',
        'expense-soft': '#ef4444'
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        sans: ["'IBM Plex Sans'", 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
