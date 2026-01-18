import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: "./e2e/global-teardown.ts",
  projects: [
    {
      fullyParallel: false, // D1 commands need sequential execution to avoid SQLITE_BUSY
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      dependencies: ["setup"],
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list", { printSteps: true }], ["html"]],
  retries: process.env.CI ? 2 : 1,
  testDir: "./e2e",
  use: {
    baseURL: process.env.CMS_URL || "http://localhost:2016",
    trace: "on-first-retry",
  },
  workers: process.env.CI ? 1 : 2,
  // Start mock GitHub API, API server, and CMS before tests
  webServer: [
    {
      command: "bun run e2e/github-mock-server.ts",
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
      url: "http://localhost:2099/user/emails",
    },
    {
      command: process.env.CI
        ? String.raw`cd ../api && printf 'E2E_TEST=1\nBETTER_AUTH_SECRET=e2e-test-secret-at-least-32-chars\nGITHUB_CLIENT_ID=test\nGITHUB_CLIENT_SECRET=test\nGITHUB_API_URL=http://localhost:2099\n' > .dev.vars && bun run migrate:up && bun run dev`
        : "cd ../api && bun run migrate:up && bun run dev",
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
