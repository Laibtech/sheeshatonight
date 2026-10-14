/** @type {import('tailwindcss').Config} */
module.exports = { darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'luxury-dark': '#09090b',
        'luxury-card': '#18181b',
        'burgundy': {
          50: '#faf5f5',
          500: '#dc2626',
          950: '#3d1f1f',
        },
        'gold': {
          400: '#f59e0b',
          500: '#eab308',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
      },
      spacing: {
        '88': '22rem',
        '100': '25rem',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-gold': 'pulse-gold 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-gold': {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
