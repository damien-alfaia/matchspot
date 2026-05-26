/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette dérivée du logo MatchSpot.
        marine: {
          50: '#eef2f8',
          100: '#d6e0f0',
          200: '#a7b9d8',
          300: '#7693c0',
          400: '#4a6da1',
          500: '#2c4f86',
          600: '#1d3d6a',
          700: '#152d50',
          800: '#0f1f3d',
          900: '#0a1730',
        },
        bleu: {
          50: '#eaf1ff',
          100: '#d4e2ff',
          200: '#a9c5ff',
          300: '#7ea7ff',
          400: '#4d83ff',
          500: '#1e5bff',
          600: '#1546d4',
          700: '#0e34a6',
          800: '#0a2680',
          900: '#071a5c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        carte: '0 1px 2px 0 rgb(15 31 61 / 0.04), 0 4px 16px -4px rgb(15 31 61 / 0.06)',
        carteHover: '0 4px 8px -2px rgb(30 91 255 / 0.10), 0 12px 24px -8px rgb(15 31 61 / 0.12)',
      },
      backgroundImage: {
        heroMarine:
          'radial-gradient(circle at 20% 20%, rgba(30,91,255,0.18) 0, transparent 50%), radial-gradient(circle at 80% 0%, rgba(30,91,255,0.12) 0, transparent 45%), linear-gradient(180deg, #0f1f3d 0%, #152d50 100%)',
        // Hero photo : dégradé bleu nuit qui assombrit le haut pour la
        // lisibilité du titre, puis allège vers le bas pour laisser
        // respirer l'ambiance bistrot. Les halos bleus radiaux du
        // heroMarine sont conservés en overlay pour la cohérence palette.
        heroPhoto:
          "radial-gradient(circle at 20% 20%, rgba(30,91,255,0.18) 0, transparent 50%), radial-gradient(circle at 80% 0%, rgba(30,91,255,0.12) 0, transparent 45%), linear-gradient(180deg, rgba(15,31,61,0.88) 0%, rgba(15,31,61,0.65) 45%, rgba(21,45,80,0.55) 100%), url('/hero-bg.webp')",
      },
    },
  },
  plugins: [],
};
