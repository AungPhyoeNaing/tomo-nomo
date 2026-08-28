/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tomo: {
          pink: '#ec4899',
          softPink: '#fdf2f8',
          bg: '#fff5f8',
          peach: '#fff7ed',
          purple: '#c084fc',
          lavender: '#f3e8ff',
          card: 'rgba(255, 255, 255, 0.94)',
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Fredoka', 'Padauk', 'Pyidaungsu', 'Myanmar3', 'Myanmar Text', 'Tharlon', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
