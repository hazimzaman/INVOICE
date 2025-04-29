/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // Path is now relative to frontend directory
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      
      'lg': '1024px',
      'xl': '1240px',
    },
    extend: {
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(5, 4, 0.2, 5)',
      },
    },
  },
  plugins: [],
} 