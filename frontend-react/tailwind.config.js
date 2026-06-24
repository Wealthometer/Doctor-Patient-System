/** @type {import('tailwindcss').Config} */
export default {
<<<<<<< HEAD
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
=======
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
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
      },
    },
  },
  plugins: [],
<<<<<<< HEAD
}
=======
}
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
