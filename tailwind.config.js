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
        m3: {
          butter: '#EDE58C',
          mint: '#CFEFD2',
          lavender: '#E9E5F4',
          blush: '#F9D6DB',
          peach: '#FCE3C8',
          forest: '#2F5D3A',
          forestHover: '#24482D',
          darkBg: '#131417',
          darkSurface: '#1E2024',
          darkSurfaceContainer: '#282A30',
        }
      },
      borderRadius: {
        '28': '28px',
        '32': '32px',
        '36': '36px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'expressive-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'expressive': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'expressive-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
