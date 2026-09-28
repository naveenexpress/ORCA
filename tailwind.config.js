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
        marine: {
          950: '#140C14', // Base page canvas
          900: '#1A111B', // Top Header & Sidebar
          850: '#24181E', // Card Surface
          800: '#1E1216', // Sub-card / metric box
          750: '#452D36', // Border
          700: '#563943', // Border hover
          600: '#C05615', // Warm Sunset Amber
          500: '#D97706', // Bright Amber
          400: '#F59E0B', // Golden Accent
          300: '#D4C2B6', // Secondary text
          200: '#947F75', // Muted text
          100: '#2E1B20', // Warm surface chip
          50: '#140C14',
        },
        ocean: {
          deep: '#FFF6EE',
          dark: '#140C14',
          primary: '#C05615',
          marine: '#D97706',
          cyan: '#F59E0B',
          lightCyan: '#2E1B20',
          soft: '#1A111B',
          bg: '#140C14',
          white: '#24181E',
          border: '#452D36',
          textPrimary: '#FFF6EE',
          textSecondary: '#D4C2B6',
          textMuted: '#947F75',
          success: '#10B981',
          lightSuccess: '#0C5240',
          warning: '#F59E0B',
          lightWarning: 'rgba(245, 158, 11, 0.16)',
          danger: '#FC4448',
          lightDanger: 'rgba(252, 68, 72, 0.16)',
        },
        cyan: {
          glow: '#F59E0B',
          neon: '#D97706',
          emerald: '#10B981',
          accent: '#F59E0B',
          50: '#1A111B',
          100: '#1E1216',
          200: '#452D36',
          300: '#F59E0B',
          400: '#F59E0B',
          500: '#D97706',
          600: '#C05615',
          700: '#FFF6EE',
          800: '#452D36',
          900: '#1E1216',
          950: '#1A111B',
        },
        slate: {
          50: '#140C14',
          100: '#FFF6EE',
          200: '#FFF6EE',
          300: '#D4C2B6',
          400: '#D4C2B6',
          500: '#947F75',
          600: '#D4C2B6',
          700: '#FFF6EE',
          800: '#FFF6EE',
          900: '#140C14',
          950: '#140C14',
        },
        emerald: {
          50: '#EAF8F1',
          100: '#EAF8F1',
          200: '#BFE7D1',
          300: '#24A978',
          400: '#16845F',
          500: '#24A978',
          600: '#16845F',
          700: '#126e4f',
          800: '#BFE7D1',
          900: '#EAF8F1',
          950: '#EAF8F1', // Light success
        },
        amber: {
          50: '#FFFDF5',
          100: '#FFF7E3',
          200: '#F0D98C',
          300: '#E7A928',
          400: '#E7A928',
          500: '#E7A928',
          600: '#D69418',
          700: '#B8790E',
          800: '#F0D98C',
          900: '#FFF7E3',
          950: '#FFF7E3', // Light warning
        },
        red: {
          50: '#FFF0F1',
          100: '#FFF0F1',
          200: '#FFD5D8',
          300: '#E5484D',
          400: '#E5484D',
          500: '#E5484D',
          600: '#E5484D',
          700: '#C5353A',
          800: '#FFD5D8',
          900: '#FFF0F1',
          950: '#FFF0F1', // Light danger
        },
        pfz: {
          gold: '#E7A928',
          high: '#24A978',
          medium: '#19B7C9',
          low: '#E7A928',
          expired: '#7890A5',
          withdrawn: '#E5484D',
        },
        alert: {
          sos: '#E5484D',
          warning: '#E7A928',
          caution: '#E7A928',
          info: '#1769AA',
          success: '#24A978',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 2px 10px rgba(25, 183, 201, 0.2)',
        'glow-teal': '0 2px 10px rgba(36, 169, 120, 0.2)',
        'glow-sos': '0 4px 15px rgba(229, 72, 77, 0.35)',
        'glow-amber': '0 2px 10px rgba(231, 169, 40, 0.2)',
        'hud': '0 4px 18px rgba(18, 59, 109, 0.06)',
        'card': '0 4px 18px rgba(18, 59, 109, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar': 'radarSweep 4s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
