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
        industrial: {
          bg: 'var(--bg)',
          'bg-secondary': 'var(--bg-secondary)',
          surface: 'var(--surface)',
          raised: 'var(--surface-raised)',
          elevated: 'var(--surface-elevated)',
          border: 'var(--border)',
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
          accent: 'var(--accent)',
          'accent-soft': 'var(--accent-soft)',
          'accent-strong': 'var(--accent-strong)',
          success: 'var(--success)',
          'success-soft': 'var(--success-soft)',
          warning: 'var(--warning)',
          'warning-soft': 'var(--warning-soft)',
          critical: 'var(--critical)',
          'critical-soft': 'var(--critical-soft)',
          info: 'var(--info)',
          'info-soft': 'var(--info-soft)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'industrial-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'industrial-md': '0 4px 12px 0 rgba(0, 0, 0, 0.35)',
        'industrial-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.45)',
        'industrial-glow': '0 0 16px -2px var(--accent-soft)'
      }
    },
  },
  plugins: [],
}
