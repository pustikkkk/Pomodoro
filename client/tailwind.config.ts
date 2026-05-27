import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mars: {
          bg: 'var(--mars-bg)',

          surface: 'var(--mars-surface)',
          border: 'var(--mars-border)',

          text: 'var(--mars-text)',
          'text-muted': 'var(--mars-text-muted)',

          rust: 'var(--mars-rust)',
          'rust-hover': 'var(--mars-rust-hover)',

          break: 'var(--mars-break)',
          'break-accent': 'var(--mars-break-accent)',
        },
      },

      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config