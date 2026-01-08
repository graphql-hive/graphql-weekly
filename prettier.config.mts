import type { Config } from 'prettier'

const config: Config = {
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
  plugins: [import.meta.resolve('prettier-plugin-astro')],
}

export default config
