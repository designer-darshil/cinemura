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
          secondary: '#8E8E93',
          muted: '#626269',
        },
        canvas: '#0B0B0D',
        ink: '#F2F0EC',
        muted: '#8E8E93',
        line: 'rgba(255, 255, 255, 0.10)',
        accent: {
          DEFAULT: '#E43D3D',
          hover: '#F04545',
          strong: '#F04545',
        },
        cinema: {
          black: '#0B0B0D',
          surface: '#111114',
          secondary: '#17171B',
          border: 'rgba(255, 255, 255, 0.10)',
          crimson: '#E43D3D',
          'crimson-hover': '#F04545',
          cream: '#F2F0EC',
          secondaryText: '#8E8E93',
          mutedText: '#626269',
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"DM Sans"', 'sans-serif'],
        heading: ['"Barlow Condensed"', '"DM Sans"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        serif: ['"Barlow Condensed"', '"DM Sans"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
        mono: ['"Manrope"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.015em',
        normal: '0em',
        wider: '0.08em',
        widest: '0.15em',
      },
    },
  },
  plugins: [],
}
