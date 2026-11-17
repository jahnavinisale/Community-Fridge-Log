/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        page: '#FAF8F4',
        ink: '#1C1B19',
        forest: {
          50: '#F2F8F5',
          100: '#E4F1EB',
          600: '#1F5E43',
          700: '#184D37',
          800: '#123D2B',
          900: '#0C2B1E',
        },
      },
    },
  },
  plugins: [],
};
