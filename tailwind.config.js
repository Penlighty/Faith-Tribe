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
        ft: {
          primary: 'var(--ft-primary)',
          'on-primary': 'var(--ft-on-primary)',
          'primary-container': 'var(--ft-primary-container)',
          'on-primary-container': 'var(--ft-on-primary-container)',
          surface: 'var(--ft-surface)',
          'surface-1': 'var(--ft-surface-1)',
          'surface-2': 'var(--ft-surface-2)',
          'on-surface': 'var(--ft-on-surface)',
          'on-surface-variant': 'var(--ft-on-surface-variant)',
          outline: 'var(--ft-outline)',
          'outline-variant': 'var(--ft-outline-variant)',
          error: 'var(--ft-error)',
          'on-error': 'var(--ft-on-error)',
          success: 'var(--ft-success)',
          tint: 'var(--ft-tint)',
        },
        game: {
          container: 'var(--game-container)',
          ink: 'var(--game-ink)',
          surface: 'var(--game-surface)',
          'on-surface': 'var(--game-on-surface)',
        },
        tribe: {
          container: 'var(--tribe-container)',
          ink: 'var(--tribe-ink)',
        },
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
        'ft-xs': 'var(--ft-radius-xs, 8px)',
        'ft-sm': 'var(--ft-radius-sm, 12px)',
        'ft-md': 'var(--ft-radius-md, 16px)',
        'ft-lg': 'var(--ft-radius-lg, 24px)',
        'ft-xl': 'var(--ft-radius-xl, 32px)',
        'ft-full': 'var(--ft-radius-full, 999px)',
        '28': '28px',
        '32': '32px',
        '36': '36px',
        'pill': '9999px',
      },
      spacing: {
        'ft-1': 'var(--ft-space-1, 4px)',
        'ft-2': 'var(--ft-space-2, 8px)',
        'ft-3': 'var(--ft-space-3, 12px)',
        'ft-4': 'var(--ft-space-4, 16px)',
        'ft-5': 'var(--ft-space-5, 20px)',
        'ft-6': 'var(--ft-space-6, 24px)',
        'ft-8': 'var(--ft-space-8, 32px)',
        'ft-10': 'var(--ft-space-10, 40px)',
        'ft-14': 'var(--ft-space-14, 56px)',
        'ft-touch': 'var(--ft-touch-min, 48px)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'ft-e0': 'var(--ft-elevation-e0, none)',
        'ft-e1': 'var(--ft-elevation-e1, 0 1px 2px rgba(27,42,33,.12))',
        'ft-e2': 'var(--ft-elevation-e2, 0 4px 12px rgba(27,42,33,.14))',
        'expressive-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'expressive': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'expressive-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        'ft-instant': 'var(--ft-motion-instant, 100ms)',
        'ft-quick': 'var(--ft-motion-quick, 200ms)',
        'ft-standard': 'var(--ft-motion-standard, 320ms)',
        'ft-emphasized': 'var(--ft-motion-emphasized, 480ms)',
      },
      transitionTimingFunction: {
        'ft-standard': 'var(--ft-easing-standard, cubic-bezier(.2,0,0,1))',
        'ft-decelerate': 'var(--ft-easing-decelerate, cubic-bezier(.05,.7,.1,1))',
      },
      zIndex: {
        'ft-nav': 'var(--ft-z-nav, 40)',
        'ft-sheet': 'var(--ft-z-sheet, 50)',
        'ft-toast': 'var(--ft-z-toast, 60)',
      }
    },
  },
  plugins: [],
}
