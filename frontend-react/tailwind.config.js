/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',   // ← Add this line
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        accent: '#14b8a6',
      },
    },
  },
  plugins: [],
}