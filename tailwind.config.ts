import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [],
  theme: {
    extend: {
      borderRadius: {
        large: '8px',
        small: '3px',
      },
      colors: {
        blue: '#009BE3',
        'body-bg': '#F1F1F4',
        'card-white': '#ffffff',
        dark: '#0a1659',
        disabled: '#959595',
        'footer-box': '#1b2357',
        'footer-box-hover': '#2c3363',
        'footer-dark': '#081146',
        'gray-border': '#dadbe3',
        green: '#27AE60',
        'light-dark': '#9da0b5',
        pink: '#F531B1',
        purple: '#6560e2',
        white: '#ffffff',
      },
      fontFamily: {
        mono: ['Roboto Mono', 'Consolas', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        huge: '48px',
        large: '24px',
        'large-32': '32px',
        medium: '18px',
        'medium-20': '20px',
        small: '14px',
        tiny: '12px',
      },
      screens: {
        md: '1001px',
      },
      spacing: {
        18: '72px',
      },
      zIndex: {
        popover: '100',
      },
    },
  },
}

export default config
