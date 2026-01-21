import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  base: "/admin",
  integrations: [react()],
  output: "server",
  server: { port: 2016 },
  vite: {
    plugins: [tailwindcss()],
  },
});
