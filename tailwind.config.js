/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './docs/**/*.{vue,md,js,ts}',
    './src/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        'theme-dark': '#2f2e2e',
        'theme-light': '#f8f3e9',
      },
    },
  },
  plugins: [],
};
