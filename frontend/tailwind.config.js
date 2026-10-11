/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            DEFAULT: '#12594C',
            dark: '#0A3B32',
            light: '#237D6C',
            surface: '#EBF4F2',
          },
          amber: {
            DEFAULT: '#B9711F',
            dark: '#8C5212',
            light: '#DC8E38',
            surface: '#FDF5EC',
          },
          coral: {
            DEFAULT: '#BD4B29',
            dark: '#933519',
            light: '#D96544',
            surface: '#FCEFEA',
          },
          bg: '#F5F2EA',
          card: '#FFFFFF',
          text: '#1E2927',
          muted: '#5F736F',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(18, 89, 76, 0.08)',
        'hover': '0 12px 30px -4px rgba(18, 89, 76, 0.15)',
        'premium': '0 20px 40px -15px rgba(18, 89, 76, 0.2)',
      }
    },
  },
  plugins: [],
}
