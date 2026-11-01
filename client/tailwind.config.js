/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg-app)',
          surface: 'var(--bg-surface)',
          subtle: 'var(--bg-subtle)',
          input: 'var(--bg-input)',
          border: 'var(--border-color)',
          borderStrong: 'var(--border-strong)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent-primary)',
          accentHover: 'var(--accent-hover)',
          accentSubtle: 'var(--accent-subtle)',
          accentText: 'var(--accent-text)',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
