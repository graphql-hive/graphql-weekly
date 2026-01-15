import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: "./e2e/global-teardown.ts",
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 1,
  testDir: "./e2e",
  use: {
    baseURL: process.env.CMS_URL || "http://localhost:2016",
    trace: "on-first-retry",
  },
  workers: process.env.CI ? 1 : 2,
  // Start both API and CMS servers before tests
  webServer: [
    {
      command: "cd ../api && bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:2012/health",
    },
    {
      command: "bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:2016",
    },
  ],
});
