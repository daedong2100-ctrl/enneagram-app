/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidian: {
          DEFAULT: '#0D0D0F',
          50: '#f5f5f6',
          100: '#e8e8ea',
          200: '#d0d0d3',
          300: '#a8a8ae',
          400: '#787880',
          500: '#5c5c65',
          600: '#4d4d55',
          700: '#3f3f47',
          800: '#27272e',
          900: '#1a1a20',
          950: '#0D0D0F',
        },
        amber: {
          DEFAULT: '#F5A623',
          light: '#FFD280',
          dark: '#C4851A',
        },
        rose: {
          soft: '#E8897A',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
