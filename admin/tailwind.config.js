/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f7',
          100: '#fce7f1',
          200: '#fad0e4',
          300: '#f7a9cd',
          400: '#f175ab',
          500: '#D63585',
          600: '#c42a76',
          700: '#a6205f',
          800: '#891d4f',
          900: '#721c44',
        },
        secondary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fc',
          400: '#36a7f8',
          500: '#377DFF',
          600: '#0b69d4',
          700: '#0b53ac',
          800: '#0f468d',
          900: '#133c74',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
