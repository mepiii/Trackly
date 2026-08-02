/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        'primary-hover': '#1d4ed8',
        surface: '#f0f0f3',
        'card-border': '#e0e1e6',
        'input-border': '#d9d9e0',
        'text-primary': '#1c2024',
        'text-secondary': '#60646c',
        'text-tertiary': '#b0b4ba',
        success: '#059669',
        danger: '#DC2626',
        // Dark mode surfaces (zinc-950 base + blue accents)
        'dark-bg': '#09090b',
        'dark-surface': '#18181b',
        'dark-card': '#27272a',
        'dark-border': '#3f3f46',
        'dark-text': '#fafafa',
        'dark-text-secondary': '#a1a1aa',
        cat: {
          food: '#F59E0B',
          transport: '#3B82F6',
          fun: '#8B5CF6',
          custom1: '#EC4899',
          custom2: '#10B981',
          custom3: '#F97316',
          custom4: '#06B6D4',
          custom5: '#84CC16',
        },
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        whisper: '0 3px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.07)',
        elevated: '0 10px 20px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.05)',
        'dark-whisper': '0 3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.25)',
      },
      letterSpacing: {
        display: '-0.05em',
        heading: '-0.025em',
      },
    },
  },
  plugins: [],
};
