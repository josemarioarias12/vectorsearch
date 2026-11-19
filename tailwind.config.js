/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#0d1321', panel: '#151c30', line: '#26304a', mut: '#8b95b0', query: '#f2b84b', doc: '#5ad1c5' },
      fontFamily: { sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
    },
  },
}
