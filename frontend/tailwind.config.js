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
          100: '#121212',
          200: '#1a1a1a',
          300: '#2a2a2a',
          400: '#3a3a3a',
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