/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rice: { 50: '#fffdf8', 100: '#fbf5ea', 200: '#f3e6d0', 300: '#ead7b8' },
        chili: { 50: '#fff1ef', 100: '#ffddd8', 400: '#f05a4a', 500: '#e13b2b', 600: '#c92f21', 700: '#a9231a' },
        amber: { 100: '#fff2c7', 400: '#f5b83f', 500: '#e69b18' },
        charcoal: { 500: '#5f5b55', 600: '#484440', 700: '#34312d', 800: '#2a2723', 900: '#211f1c' },
      },
      boxShadow: {
        card: '0 10px 30px rgba(70, 45, 25, 0.08)',
        float: '0 18px 55px rgba(78, 34, 20, 0.18)',
        'card-dark': '0 10px 30px rgba(0, 0, 0, 0.3)',
        'float-dark': '0 18px 55px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: { sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'] },
      keyframes: { rise: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } },
      animation: { rise: 'rise .35s ease-out both' },
    },
  },
  plugins: [],
}
