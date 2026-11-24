/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fbf7f1',
          100: '#f5ebdd',
          200: '#ead6b8',
          300: '#dbb98a',
          400: '#ca985c',
          500: '#b97f3f',
          600: '#a26632',
          700: '#844e2b',
          800: '#6d4028',
          900: '#5a3524',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d8dce4',
          300: '#b3bac7',
          400: '#8792a5',
          500: '#6b7789',
          600: '#556073',
          700: '#444d5e',
          800: '#2c3443',
          900: '#1b2230',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
        pop: '0 12px 32px -8px rgba(16, 24, 40, 0.18), 0 4px 10px -4px rgba(16, 24, 40, 0.08)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn .18s ease-out',
        slideDown: 'slideDown .16s ease-out',
        slideIn: 'slideIn .18s ease-out',
      },
    },
  },
  plugins: [],
};
