/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F1A',
        surface: '#111827',
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        border: 'rgba(255,255,255,0.08)',
        card: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
