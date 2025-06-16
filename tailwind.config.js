/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#003865',        // TBWA Navy
        accent: '#FFC72C',         // Yellow highlight
        neutral: '#F9FAFB',        // Soft gray background
        brandText: '#1A1A1A',      // Dark text
        tbwa: {
          navy: '#003865',
          yellow: '#FFC72C',
          'navy-50': '#f0f7ff',
          'navy-100': '#e0efff',
          'navy-200': '#b9dfff',
          'navy-300': '#7cc7ff',
          'navy-400': '#36a9ff',
          'navy-500': '#0e8fff',
          'navy-600': '#0073ff',
          'navy-700': '#0061ff',
          'navy-800': '#0054e6',
          'navy-900': '#003865',
          'yellow-50': '#fffdf0',
          'yellow-100': '#fff9c2',
          'yellow-200': '#fff387',
          'yellow-300': '#ffe742',
          'yellow-400': '#ffdb0d',
          'yellow-500': '#FFC72C',
          'yellow-600': '#e5a500',
          'yellow-700': '#cc9400',
          'yellow-800': '#b38300',
          'yellow-900': '#996f00',
        },
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
};
