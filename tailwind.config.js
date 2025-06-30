/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  theme: {
    extend: {
      zIndex: {
        '60': '60',
      }
    },
  },
  plugins: [],
}