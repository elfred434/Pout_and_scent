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
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Accent doré/rosé pour premium
        accent: {
          50: '#fefbf3',
          100: '#fdf3e0',
          200: '#f9e4c1',
          300: '#f2d1a0',
          400: '#e8b4b8',
          500: '#d4a574',
          600: '#c8956c',
          700: '#b8860b',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#f0f0f2', // #F8F8FA approximé
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subtitle': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      borderRadius: {
        'xl': '0.75rem',   // 12px - cartes/inputs/boutons
        '2xl': '1rem',     // 16px - grands blocs (hero, bannières)
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'hero': '0 20px 40px -8px rgba(147, 51, 234, 0.15)',
      },
    },
  },
  plugins: [],
}