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
        // Space theme colors (dark mode) - Deep, rich space tones
        'space-black': '#050508', // Darker black
        'space-dark': '#0f1016',  // Deep blue-black
        'space-mid': '#1a1b26',   // Lighter blue-black
        'space-light': '#2a2b3d', // Highlight

        // Accents - Neon/Cyberpunk inspired
        'accent-cyan': '#00f0ff', // Cyberpunk cyan
        'accent-cyan-dim': 'rgba(0, 240, 255, 0.1)',
        'accent-gold': '#ffd700', // Gold
        'accent-purple': '#bc13fe', // Neon purple
        'accent-pink': '#ff0099', // Neon pink
        'accent-green': '#00ff9d', // Neon green

        // Text
        'text-primary': '#f0f2f5',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',

        // Light mode colors (Clean, modern)
        'light-bg': '#f8fafc',
        'light-surface': '#ffffff',
        'light-text': '#0f172a',
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
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #1a1b26 0deg, #0f1016 180deg, #1a1b26 360deg)',
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'bounce-once': 'bounceOnce 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
