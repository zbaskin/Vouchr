/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        'primary-content': 'var(--primary-content)',
        secondary: 'var(--secondary)',
        'secondary-content': 'var(--secondary-content)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        copy: 'var(--copy)',
        'copy-light': 'var(--copy-light)',
        'copy-lighter': 'var(--copy-lighter)',
      },
    },
  },
  plugins: [],
};
