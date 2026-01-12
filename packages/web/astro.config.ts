import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [react(), sitemap()],
  site: "https://www.graphqlweekly.com",
  vite: {
    // @ts-expect-error - tailwindcss types not synced, but it works
    plugins: [tailwindcss()],
  },
});
