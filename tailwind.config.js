/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sim: {
          bg:     '#0f172a',
          panel:  '#1e293b',
          border: '#334155',
          accent: '#38bdf8',
          warn:   '#f59e0b',
          ok:     '#4ade80',
          danger: '#f87171',
        },
      },
    },
  },
  plugins: [],
};
