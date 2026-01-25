import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      enabled: true,
      configPath: "./wrangler.jsonc",
    },
  }),
  integrations: [react(), sitemap()],
  server: { port: 2015 },
  site: "https://www.graphqlweekly.com",
  vite: {
    plugins: [tailwindcss() as PluginOption],
  },
});

type AstroConfig = ReturnType<typeof defineConfig>;
type ViteConfig = Required<AstroConfig>["vite"];
type PluginOption = Required<ViteConfig>["plugins"][number];
