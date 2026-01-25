import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list", { printSteps: true }], ["html"]],
  // SQLite/wrangler limitation — same as CMS
  workers: 1,
  use: {
    baseURL: "http://localhost:2015",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "./scripts/start-api.sh",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://localhost:2015",
  },
});
