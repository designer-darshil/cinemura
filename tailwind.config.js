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
        bg: '#0B0B0D',
        surface: {
          DEFAULT: '#111114',
          secondary: '#17171B',
        },
        text: {
          primary: '#F2F0EC',
          secondary: '#929298',
          muted: '#626269',
        },
        accent: {
          DEFAULT: '#E43D3D',
          hover: '#F04545',
        },
        cinema: {
          black: '#0B0B0D',
          surface: '#111114',
          secondary: '#17171B',
          border: 'rgba(255, 255, 255, 0.10)',
          crimson: '#E43D3D',
          'crimson-hover': '#F04545',
          cream: '#F2F0EC',
          secondaryText: '#929298',
          mutedText: '#626269',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Syne"', 'sans-serif'],
        heading: ['"Syne"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        widest: '0.20em',
        mega: '0.30em',
      },
      maxWidth: {
        'site': '1320px',
      },
    },
  },
  plugins: [],
}
