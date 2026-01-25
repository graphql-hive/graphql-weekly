import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: [["list", { printSteps: true }], ["html"]],
  retries: process.env.CI ? 2 : 1,
  testDir: "./tests/e2e",
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
  webServer: [
    {
      command:
        "cd ../api && bun run migrate:up && bunx wrangler dev --port 2013 --env-file .dev.vars.e2e",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:2013/health",
    },
    {
      command: "bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:2015",
    },
  ],
  workers: 1,
});
