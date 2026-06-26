/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--color-primary-container) / <alpha-value>)',
        'primary-fixed': 'rgb(var(--color-primary-fixed) / <alpha-value>)',
        'primary-fixed-dim': 'rgb(var(--color-primary-fixed-dim) / <alpha-value>)',
        tertiary: {
          DEFAULT: 'rgb(var(--color-tertiary) / <alpha-value>)',
          50: 'rgb(249 245 236 / <alpha-value>)',
          100: 'rgb(239 230 204 / <alpha-value>)',
          500: 'rgb(var(--color-tertiary) / <alpha-value>)',
          700: 'rgb(138 117 62 / <alpha-value>)',
          800: 'rgb(100 86 45 / <alpha-value>)',
          900: 'rgb(62 55 28 / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          bright: 'rgb(var(--color-surface-bright) / <alpha-value>)',
          dim: 'rgb(var(--color-surface-dim) / <alpha-value>)',
          container: 'rgb(var(--color-surface-container) / <alpha-value>)',
          'container-low': 'rgb(var(--color-surface-container-low) / <alpha-value>)',
          'container-lowest': 'rgb(var(--color-surface-container-lowest) / <alpha-value>)',
          'container-high': 'rgb(var(--color-surface-container-high) / <alpha-value>)',
          'container-highest': 'rgb(var(--color-surface-container-highest) / <alpha-value>)',
        },
        legal: {
          50: 'rgb(var(--color-legal-50) / <alpha-value>)',
          100: 'rgb(var(--color-legal-100) / <alpha-value>)',
          200: 'rgb(var(--color-legal-200) / <alpha-value>)',
          300: 'rgb(var(--color-legal-300) / <alpha-value>)',
          400: 'rgb(var(--color-legal-400) / <alpha-value>)',
          500: 'rgb(var(--color-legal-500) / <alpha-value>)',
          600: 'rgb(var(--color-legal-600) / <alpha-value>)',
          700: 'rgb(var(--color-legal-700) / <alpha-value>)',
          800: 'rgb(var(--color-legal-800) / <alpha-value>)',
          900: 'rgb(var(--color-legal-900) / <alpha-value>)',
          950: 'rgb(var(--color-legal-950) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          50: 'rgb(252 232 232 / <alpha-value>)',
          800: 'rgb(74 11 11 / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Public Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
      boxShadow: {
        'ambient': '0 0 32px rgba(0, 20, 48, 0.06)',
      },
    },
  },
  plugins: [],
}
