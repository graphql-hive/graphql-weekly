// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://www.graphqlweekly.com',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [react(), tailwind(), sitemap()],
})
