import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [react(), tailwind(), sitemap()],
  site: "https://www.graphqlweekly.com",
});
