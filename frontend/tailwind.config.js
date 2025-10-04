/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dolphin-dark': '#08233F',
        'dolphin-light': '#1B648E',
      },
      fontFamily: {
        'tajawal': ['Tajawal', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
