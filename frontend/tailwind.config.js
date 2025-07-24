/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00C851', // Green accent color
        secondary: '#1a1a1a', // Dark background
        dark: {
          100: '#000000',
          200: '#0a0a0a',
          300: '#141414',
          400: '#1e1e1e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}