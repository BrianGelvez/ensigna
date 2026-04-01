/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ensigna: {
          primary: '#bf201d',
          'primary-dark': '#c62828',
          'primary-light': '#ff6f60',
          bg: '#f8fafc',
          surface: 'rgba(255, 255, 255, 0.6)',
          text: '#1a1a1a',
          muted: '#6b7280',
        },
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      borderRadius: {
        ensigna: '16px',
        'ensigna-lg': '20px',
        'ensigna-btn': '12px',
      },
      boxShadow: {
        ensigna: '0 8px 32px rgba(0, 0, 0, 0.08)',
        'ensigna-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'ensigna-red': '0 4px 14px rgba(191, 32, 29, 0.25)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
