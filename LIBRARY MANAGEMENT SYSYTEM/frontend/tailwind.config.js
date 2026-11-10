/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18232d',
        paper: '#f5f3ee',
        parchment: '#e9e4d8',
        brass: '#b99a62',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
