import { test, expect } from '@playwright/test'
// @ts-expect-error
import { getComparator } from 'playwright-core/lib/utils'

const PRODUCTION_BASE = 'https://www.graphqlweekly.com'
const PATHS_TO_TEST = ['/issues/396', '/topic/Tools--Open-Source']

for (const path of PATHS_TO_TEST) {
  const slug = path.slice(1).replaceAll('/', '-') || 'index'
  test(`compare ${path}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })

    try {
      const takeScreenshot = async (
        url: string,
        screenshotPath: string,
        waitMs: number,
      ) => {
        const page = await context.newPage()
        await page.goto(url, { waitUntil: 'load', timeout: 30000 })
        await page.waitForTimeout(waitMs)
        const screenshot = await page.screenshot({
          fullPage: true,
          animations: 'disabled',
          path: screenshotPath,
        })
        await page.close()
        return screenshot
      }

      const [productionScreenshot, localScreenshot] = await Promise.all([
        takeScreenshot(
          `${PRODUCTION_BASE}${path}`,
          `./screenshots/${slug}-production.png`,
          2000,
        ),
        takeScreenshot(path, `./screenshots/${slug}-local.png`, 3000),
      ])

      const comparator = getComparator('image/png')
      expect(
        comparator(productionScreenshot, localScreenshot)?.errorMessage || null,
      ).toBeNull()
    } catch (error) {
      console.error(`❌ Error testing ${path}:`, error.message)
      throw error
    } finally {
      await context.close()
    }
  })
}
