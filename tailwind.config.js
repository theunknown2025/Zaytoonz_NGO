/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f7f8f3',
          100: '#eef0e6',
          200: '#dde2cd',
          300: '#c6cfa8',
          400: '#adb885',
          500: '#94a167',
          600: '#7a8651',
          700: '#606942',
          800: '#4f5537',
          900: '#43472f',
          DEFAULT: '#556B2F',
          light: '#9ACD32',
          medium: '#6B8E23',
          dark: '#3A4D1F',
        },
        accent: {
          DEFAULT: '#BDB76B',
          light: '#8FBC8F',
          complement: '#CD853F',
        },
      },
      backgroundImage: {
        'olive-gradient': 'linear-gradient(135deg, #94a167 0%, #7a8651 50%, #606942 100%)',
        'olive-gradient-light': 'linear-gradient(135deg, #eef0e6 0%, #dde2cd 50%, #c6cfa8 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 