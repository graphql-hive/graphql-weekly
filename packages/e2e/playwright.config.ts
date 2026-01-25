import { defineConfig, devices } from "@playwright/test";

import { API_URL, CMS_URL, GITHUB_MOCK_URL, WEB_URL } from "./src/urls";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./src/global-teardown.ts",
  projects: [
    {
      name: "setup",
      testDir: "./src",
      testMatch: /global-setup\.ts/,
    },
    {
      dependencies: ["setup"],
      name: "e2e",
      testDir: "./src",
      testMatch: /\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
      },
    },
  ],
  reporter: [["list", { printSteps: true }], ["html"]],
  retries: process.env.CI ? 2 : 1,
  use: {
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "bun run src/github-mock-server.ts",
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
      url: `${GITHUB_MOCK_URL}/user/emails`,
    },
    {
      command: "cd ../api && bunx wrangler dev --env-file .dev.vars.e2e",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: `${API_URL}/health`,
    },
    {
      command: "cd ../cms && bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: CMS_URL,
    },
    {
      command: "cd ../web && bun run dev",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: WEB_URL,
    },
  ],
  workers: 1,
});
