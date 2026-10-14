import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0E12',
        surface: {
          DEFAULT: '#13151D',
          hover: '#191C27',
          subtle: '#161922',
        },
        border: {
          DEFAULT: '#1E2230',
          focus: '#A3E635',
        },
        neon: {
          DEFAULT: '#A3E635',
          hover: '#BEF264',
          dim: '#84CC16',
          muted: 'rgba(163, 230, 53, 0.12)',
          border: 'rgba(163, 230, 53, 0.35)',
        },
        graphite: {
          50: '#F6F7F9',
          100: '#E4E7EB',
          200: '#C9CED6',
          300: '#949BA8',
          400: '#676E7D',
          500: '#474D5A',
          600: '#323742',
          700: '#232731',
          800: '#181B22',
          900: '#0E1015',
          950: '#08090C',
        },
        expense: {
          DEFAULT: '#F87171',
          muted: 'rgba(248, 113, 113, 0.12)',
        },
        income: {
          DEFAULT: '#4ADE80',
          muted: 'rgba(74, 222, 128, 0.12)',
        },
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(163, 230, 53, 0.25)',
        'neon-md': '0 0 20px rgba(163, 230, 53, 0.35)',
        'neon-lg': '0 0 35px rgba(163, 230, 53, 0.45)',
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};

export default config;

