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
        // Luxury Editorial Palette
        background: '#0A0A0B',
        surface: '#111114',
        'surface-2': '#1A1A1F',
        border: '#2A2A32',
        accent: {
          DEFAULT: '#C9A96E',
          soft: 'rgba(201, 169, 110, 0.12)',
          hover: '#D4B87A',
        },
        'text-primary': '#F5F0E8',
        'text-secondary': '#8A8694',
        'text-tertiary': '#4A4654',
        success: '#4ADE80',
        danger: '#F87171',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255, 255, 255, 0.04), 0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 0 0 1px rgba(201, 169, 110, 0.2), 0 10px 30px rgba(0, 0, 0, 0.4)',
        'gold': '0 0 0 1px rgba(201, 169, 110, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 300ms ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
