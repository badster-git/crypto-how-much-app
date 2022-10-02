/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': {
          light: '#F9F9FA',
          DEFAULT: '#F4F4F0',
          dark: '#FFE9C9'
        },
        'brick': {
          DEFAULT: '#93625b',
          dark: '#75413F'
        }
      }
    },
  },
  plugins: [],
}
