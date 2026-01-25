import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: [["list", { printSteps: true }], ["html"]],
  retries: process.env.CI ? 2 : 1,
  testDir: "./tests/e2e",
  // SQLite/wrangler limitation — same as CMS
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  use: {
    baseURL: "http://localhost:2015",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "./scripts/start-api.sh",
    port: 2015,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  workers: 1,
});
