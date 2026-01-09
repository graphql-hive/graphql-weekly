import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'light-dark': '#9da0b5',
        dark: '#0a1659',
        purple: '#6560e2',
        white: '#ffffff',
        'gray-border': '#dadbe3',
        'body-bg': '#F1F1F4',
        'card-white': '#ffffff',
        'footer-dark': '#081146',
        'footer-box': '#1b2357',
        'footer-box-hover': '#2c3363',
        pink: '#F531B1',
        blue: '#009BE3',
        green: '#27AE60',
        disabled: '#959595',
      },
      spacing: {
        18: '72px',
      },
      borderRadius: {
        small: '3px',
        large: '8px',
      },
      fontSize: {
        tiny: '12px',
        small: '14px',
        medium: '18px',
        'medium-20': '20px',
        large: '24px',
        'large-32': '32px',
        huge: '48px',
      },
      fontFamily: {
        mono: ['Roboto Mono', 'Consolas', 'Menlo', 'Monaco', 'monospace'],
      },
      zIndex: {
        popover: '100',
      },
      screens: {
        md: '1001px',
      },
    },
  },
  plugins: [],
}

export default config
