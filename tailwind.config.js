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

        // Deep Sea Carousel theme
        'carousel-background': '#0D1B2A',
        'carousel-card-background': '#1B263B',
        'carousel-arrow-background': '#415A77',
        'carousel-arrow-color': '#E0E1DD',
        'carousel-dot-color': '#778DA9',
        'carousel-dot-active-color': '#E0E1DD',
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
        // New micro-interaction animations
        'press': 'press 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        'lift': 'lift 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake': 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'count-up': 'countUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-down': 'fadeInDown 0.4s ease-out forwards',
        'slide-in-up': 'slideInUp 0.4s ease-out forwards',
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
          '0%': {
            boxShadow: '0 0 5px rgba(0, 240, 255, 0.4), 0 0 10px rgba(0, 240, 255, 0.3)',

          },
          '100%': {
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 30px rgba(0, 240, 255, 0.6)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
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
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        lift: {
          '0%': { transform: 'translateY(0)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
          '100%': { transform: 'translateY(-4px)', boxShadow: '0 20px 25px -5px rgba(0, 240, 255, 0.2), 0 10px 10px -5px rgba(0, 240, 255, 0.1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 30px rgba(0, 240, 255, 0.3)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
