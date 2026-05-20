/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        church: {
          50: 'color-mix(in srgb, var(--brand-primary) 8%, white)',
          100: 'color-mix(in srgb, var(--brand-primary) 15%, white)',
          200: 'color-mix(in srgb, var(--brand-primary) 25%, white)',
          700: 'var(--brand-primary-dark)',
          800: 'var(--brand-primary)',
          900: 'var(--brand-primary-dark)',
          950: 'var(--brand-primary-darker)',
        },
        gold: {
          100: 'var(--brand-accent-light)',
          200: 'color-mix(in srgb, var(--brand-accent) 35%, white)',
          300: 'color-mix(in srgb, var(--brand-accent) 55%, white)',
          400: 'color-mix(in srgb, var(--brand-accent) 75%, white)',
          500: 'var(--brand-accent)',
          600: 'color-mix(in srgb, var(--brand-accent) 85%, black)',
        },
      },
    },
  },
  plugins: [],
}
