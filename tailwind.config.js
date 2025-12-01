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
        // Space theme colors (dark mode)
        'space-black': '#0a0a0f',
        'space-dark': '#1a1a2e',
        'space-mid': '#16213e',
        'accent-cyan': '#00d4ff',
        'accent-gold': '#ffd700',
        'accent-purple': '#8b5cf6',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',

        // Light mode colors
        'light-bg': '#f8fafc',
        'light-surface': '#ffffff',
        'light-text': '#1e293b',
        'light-text-secondary': '#64748b',

        // Security status colors (EVE accurate)
        'sec-10': '#2fefef',   // 1.0
        'sec-09': '#48f048',   // 0.9
        'sec-08': '#00ef47',   // 0.8
        'sec-07': '#00ef00',   // 0.7
        'sec-06': '#8fef2f',   // 0.6
        'sec-05': '#efef00',   // 0.5
        'sec-04': '#d77700',   // 0.4
        'sec-03': '#f06000',   // 0.3
        'sec-02': '#f04800',   // 0.2
        'sec-01': '#d73000',   // 0.1
        'sec-00': '#f00000',   // 0.0 and below
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
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
