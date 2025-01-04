import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // reference: https://brand.duke.edu/colors/
        'duke-dark': '#012169',
        'duke-light': '#00539B',
        limestone: '#E5E5E5',
        // use for dark cards
        graphite: '#666666',
      },
      keyframes: {
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '25%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        slideInFromLeft: 'slideInFromLeft 1.5s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
