// @ts-check
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.HTML_REPORT ? [['html'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bun run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
})
