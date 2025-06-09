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
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 