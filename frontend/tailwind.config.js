import preset from '../shared/design-tokens/tailwind.preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [preset],
};

