import colors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-subtle': 'var(--bg-subtle)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'inverse-bg': 'var(--inverse-bg)',
        'inverse-fg': 'var(--inverse-fg)',
        focus: 'var(--focus)',
      },
      fontFamily: {
        sans: [
          'Bell MT',
          'BellMT',
          'Georgia',
          'serif',
        ],
        body: [
          'Bell MT',
          'BellMT',
          'Georgia',
          'serif',
        ],
        serif: [
          'Bell MT',
          'BellMT',
          'Georgia',
          'serif',
        ],
      },
    },
  },
};
