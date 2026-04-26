/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        dancing: ['Dancing Script', 'cursive'],
        lato: ['Lato', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        pacifico: ['Pacifico', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        kitty: {
          pink: '#f472b6',
          rose: '#fb7185',
          blush: '#fce4ec',
          lavender: '#e9d5ff',
          lilac: '#c084fc',
          cream: '#fef9f0',
          mauve: '#d8b4fe',
          peach: '#fed7aa',
          sage: '#bbf7d0',
          sky: '#bae6fd',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft: { '0%, 100%': { opacity: '0.8' }, '50%': { opacity: '1' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glass': '0 8px 32px rgba(244, 114, 182, 0.15)',
        'card': '0 4px 24px rgba(196, 132, 252, 0.12)',
        'glow': '0 0 20px rgba(244, 114, 182, 0.3)',
        'inner-glass': 'inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
};
