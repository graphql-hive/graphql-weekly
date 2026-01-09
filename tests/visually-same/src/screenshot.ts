import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright'

import { config } from './config.js'

export async function captureScreenshot(
  page: Page,
  path: string,
): Promise<void> {
  await page.screenshot({
    animations: 'disabled',
    fullPage: true,
    path,
  })
}

export async function setupBrowser(): Promise<{
  browser: Browser
  context: BrowserContext
  page: Page
}> {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: config.viewport,
  })
  const page = await context.newPage()

  return { browser, context, page }
}

export async function takeScreenshot(
  url: string,
  outputPath: string,
  waitMs = 2000,
): Promise<void> {
  const { browser, context, page } = await setupBrowser()

  try {
    await page.goto(url, {
      timeout: 30_000,
      waitUntil: 'load',
    })

    // Wait for any dynamic content to settle
    await page.waitForTimeout(waitMs)

    await captureScreenshot(page, outputPath)
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message?.includes('net::ERR_CONNECTION_REFUSED')
    ) {
      throw new Error(
        `Cannot connect to ${url}\n\nPlease start the preview server first:\n  bun run preview`,
      )
    }
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export async function takeAllScreenshots(
  suffix: 'baseline' | 'local' | 'production',
  onProgress?: (current: number, total: number, page: string) => void,
): Promise<void> {
  const { baseUrl, pages, productionUrl, screenshotsDir } = config

  // Determine which URL to use
  const useProduction = suffix === 'production'
  const baseUrlToUse = useProduction ? productionUrl : baseUrl

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const url = `${baseUrlToUse}${page.path}`
    const outputPath = `${screenshotsDir}/${page.name}-${suffix}.png`

    if (onProgress) {
      onProgress(i + 1, pages.length, page.name)
    }

    await takeScreenshot(url, outputPath)
  }
}
