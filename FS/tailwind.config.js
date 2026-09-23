/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#060608',
        'obsidian-2': '#0a0a0c',
        'obsidian-card': '#0f0f12',
        neon: '#E8FF00',
        electric: '#00D4FF',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"Syne"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
      animation: {
        marquee:     'marquee 40s linear infinite',
        'float-up':  'floatUp 6s ease-in-out infinite',
        'float-dn':  'floatDn 5s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatUp: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        floatDn: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
}