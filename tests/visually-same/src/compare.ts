import { compare, ODiffServer } from 'odiff-bin'
import { config } from './config.js'

export interface CompareResult {
  match: boolean
  reason?: string
  diffCount?: number
  diffPercentage?: number
}

export async function compareImages(
  baselinePath: string,
  currentPath: string,
  diffPath?: string,
): Promise<CompareResult> {
  const result = await compare(
    baselinePath,
    currentPath,
    diffPath || '',
    {
      threshold: config.odiffThreshold,
      antialiasing: true,
      diffColor: config.diffColor,
      diffOverlay: true,
    },
  )

  return {
    match: result.match,
    reason: result.match ? undefined : result.reason,
    diffCount: result.diffCount,
    diffPercentage: result.diffPercentage,
  }
}

export async function compareAll(
  onProgress?: (current: number, total: number, page: string, result: CompareResult) => void,
): Promise<{ passed: number; failed: number }> {
  const { pages, screenshotsDir } = config
  let passed = 0
  let failed = 0

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const baselinePath = `${screenshotsDir}/${page.name}-baseline.png`
    const currentPath = `${screenshotsDir}/${page.name}-local.png`
    const diffPath = `${screenshotsDir}/${page.name}-diff.png`

    const result = await compareImages(baselinePath, currentPath, diffPath)

    if (result.match) {
      passed++
    } else {
      failed++
    }

    if (onProgress) {
      onProgress(i + 1, pages.length, page.name, result)
    }
  }

  return { passed, failed }
}
