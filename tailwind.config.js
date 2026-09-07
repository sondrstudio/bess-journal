/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgba(var(--color-primary), <alpha-value>)',
        accent: 'rgba(var(--color-accent), <alpha-value>)',
        background: 'rgba(var(--color-background), <alpha-value>)',
        ink: 'rgba(var(--color-ink), <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', '"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        handwritten: ['"Satisfy"', '"Caveat"', 'cursive'],
        body: ['"Merriweather"', '"Lora"', 'serif'],
      },
    },
  },
  plugins: [],
}
