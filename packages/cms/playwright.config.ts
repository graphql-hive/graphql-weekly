import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    // CMS runs on port 4321 (Astro dev) or custom port
    baseURL: process.env.CMS_URL || "http://localhost:4321",
    trace: "on-first-retry",
  },
  workers: process.env.CI ? 1 : undefined,
  // Start both API and CMS servers before tests
  webServer: [
    {
      command: "cd ../api && bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: "http://localhost:8787/health",
    },
    {
      command: "bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: "http://localhost:4321/admin",
    },
  ],
});
