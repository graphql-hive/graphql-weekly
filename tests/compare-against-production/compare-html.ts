#!/usr/bin/env bun

import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'

/**
 * Comparison script to verify Astro build output matches production GraphQL Weekly site
 * Usage: bun run compare-html.ts [route]
 */

const PROJECT_ROOT = join(dirname(import.meta.path), '../..')
const PRODUCTION_BASE = 'https://www.graphqlweekly.com'
const LOCAL_DIST_PATH = join(PROJECT_ROOT, 'dist')
const RESULTS_PATH = join(PROJECT_ROOT, 'comparison-results.json')

const TEST_ROUTES = [
  '/',
  '/issues/399',
  '/issues/397',
  '/issues/350',
  '/issues/100',
  '/topic/Articles',
  '/topic/Events',
  '/topic/graphql-tools',
  '/topic/libraries',
]

interface Issue {
  type: string
  detail?: string
  production?: string
  local?: string
  name?: string
  ratio?: number
}

interface CompareResult {
  path: string
  status: 'match' | 'minor_differences' | 'error' | 'failure'
  error?: string
  issues: Issue[]
  stats: {
    productionSize: number
    localSize: number
    sizeDifference: number
    linksDiff: number
    headingsDiff: number
  }
}

interface Results {
  timestamp: string
  summary: {
    total: number
    matches: number
    minorDifferences: number
    errors: number
    failures: number
  }
  details: CompareResult[]
}

interface Structure {
  title: string
  metaTags: { name: string; content: string }[]
  links: { rel: string; href: string }[]
  scripts: string[]
  bodyClasses: string
  linkCount: number
  headingCount: number
}

function normalizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*data-astro-[^=]*="[^"]*"/g, '')
    .replace(/\s*data-reactroot="[^"]*"/g, '')
    .replace(/\s*data-react-helmet="[^"]*"/g, '')
    .replace(/client\.[a-zA-Z0-9]+\.js/g, 'client.hash.js')
    .replace(/index\.[a-zA-Z0-9]+\.js/g, 'index.hash.js')
    .replace(/_astro\/[^"']*\.[a-zA-Z0-9]+\./g, '_astro/file.hash.')
    .replace(/\?v=\w+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

function extractStructure(html: string): Structure {
  const structure: Structure = {
    title: html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || '',
    metaTags: [],
    links: [],
    scripts: [],
    bodyClasses: html.match(/<body[^>]*class="([^"]*)"[^>]*>/i)?.[1] || '',
    linkCount: (html.match(/<a [^>]*href/g) || []).length,
    headingCount: (html.match(/<h[1-6][^>]*>/g) || []).length,
  }

  // Extract meta tags
  for (const match of html.matchAll(/<meta[^>]+>/gi)) {
    const meta = match[0]
    const name = meta.match(/name="([^"]*)"/) || meta.match(/property="([^"]*)"/)
    const content = meta.match(/content="([^"]*)"/)
    if (name && content) {
      structure.metaTags.push({ name: name[1], content: content[1] })
    }
  }

  // Extract link tags
  for (const match of html.matchAll(/<link[^>]+>/gi)) {
    const link = match[0]
    const rel = link.match(/rel="([^"]*)"/)
    const href = link.match(/href="([^"]*)"/)
    if (rel) {
      structure.links.push({ rel: rel[1], href: href?.[1] || '' })
    }
  }

  // Extract script sources
  for (const match of html.matchAll(/<script[^>]*src="([^"]*)"[^>]*>/gi)) {
    structure.scripts.push(match[1])
  }

  return structure
}

async function fetchProductionHtml(path: string): Promise<string | null> {
  const url = `${PRODUCTION_BASE}${path}`
  console.log(`  Fetching production: ${url}`)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'GraphQL-Weekly-Comparison/1.0' },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`  Failed to fetch ${url}:`, (error as Error).message)
    return null
  }
}

async function readLocalHtml(path: string): Promise<string | null> {
  const localPath =
    path === '/'
      ? join(LOCAL_DIST_PATH, 'index.html')
      : join(LOCAL_DIST_PATH, path, 'index.html')

  console.log(`  Reading local: ${localPath}`)

  if (!existsSync(localPath)) {
    console.error(`  Local file not found: ${localPath}`)
    return null
  }

  try {
    return await readFile(localPath, 'utf-8')
  } catch (error) {
    console.error(`  Failed to read ${localPath}:`, (error as Error).message)
    return null
  }
}

function compareHtml(
  productionHtml: string,
  localHtml: string,
  path: string,
): CompareResult {
  const result: CompareResult = {
    path,
    status: 'match',
    issues: [],
    stats: {
      productionSize: productionHtml.length,
      localSize: localHtml.length,
      sizeDifference: localHtml.length - productionHtml.length,
      linksDiff: 0,
      headingsDiff: 0,
    },
  }

  const normalizedProd = normalizeHtml(productionHtml)
  const normalizedLocal = normalizeHtml(localHtml)

  const prodStructure = extractStructure(productionHtml)
  const localStructure = extractStructure(localHtml)

  result.stats.linksDiff = Math.abs(prodStructure.linkCount - localStructure.linkCount)
  result.stats.headingsDiff = Math.abs(prodStructure.headingCount - localStructure.headingCount)

  // Compare title
  if (prodStructure.title !== localStructure.title) {
    result.issues.push({
      type: 'title_mismatch',
      production: prodStructure.title,
      local: localStructure.title,
    })
  }

  // Compare meta tags
  const prodMetaKeys = new Set(prodStructure.metaTags.map((m) => m.name))
  const localMetaKeys = new Set(localStructure.metaTags.map((m) => m.name))

  for (const key of prodMetaKeys) {
    if (!localMetaKeys.has(key)) {
      result.issues.push({
        type: 'missing_meta_tag',
        name: key,
        production: prodStructure.metaTags.find((m) => m.name === key)?.content,
      })
    }
  }

  // Check content size difference
  const contentDiffRatio =
    Math.abs(normalizedProd.length - normalizedLocal.length) / normalizedProd.length

  if (contentDiffRatio > 0.1) {
    result.issues.push({
      type: 'significant_content_difference',
      ratio: contentDiffRatio,
      detail: `Content differs by ${(contentDiffRatio * 100).toFixed(1)}%`,
    })
  }

  // Check link/heading counts
  if (result.stats.linksDiff > 2) {
    result.issues.push({
      type: 'link_count_mismatch',
      detail: `Links: ${prodStructure.linkCount} → ${localStructure.linkCount} (±${result.stats.linksDiff})`,
    })
  }

  if (result.stats.headingsDiff > 1) {
    result.issues.push({
      type: 'heading_count_mismatch',
      detail: `Headings: ${prodStructure.headingCount} → ${localStructure.headingCount} (±${result.stats.headingsDiff})`,
    })
  }

  // Check for missing core content
  if (
    !normalizedLocal.includes('GraphQL Weekly') &&
    normalizedProd.includes('GraphQL Weekly')
  ) {
    result.issues.push({
      type: 'missing_core_content',
      detail: 'Local version missing "GraphQL Weekly" content',
    })
    result.status = 'error'
  }

  // Determine status
  if (result.issues.length === 0) {
    result.status = 'match'
  } else if (result.issues.some((i) => i.type === 'missing_core_content')) {
    result.status = 'error'
  } else if (
    result.issues.some(
      (i) =>
        i.type === 'significant_content_difference' ||
        i.type === 'link_count_mismatch' ||
        i.type === 'heading_count_mismatch',
    )
  ) {
    result.status = 'error'
  } else {
    result.status = 'minor_differences'
  }

  return result
}

async function runComparison() {
  const targetRoute = process.argv[2]
  const routesToTest = targetRoute ? [targetRoute] : TEST_ROUTES

  console.log('Comparing production vs local dist build...\n')

  if (!existsSync(LOCAL_DIST_PATH)) {
    console.error(`dist/ not found. Run: bun run build`)
    process.exit(1)
  }

  const results: Results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: routesToTest.length,
      matches: 0,
      minorDifferences: 0,
      errors: 0,
      failures: 0,
    },
    details: [],
  }

  for (const path of routesToTest) {
    console.log(`\n${path}`)

    const [productionHtml, localHtml] = await Promise.all([
      fetchProductionHtml(path),
      readLocalHtml(path),
    ])

    if (!productionHtml || !localHtml) {
      results.details.push({
        path,
        status: 'failure',
        error: !productionHtml ? 'Failed to fetch production' : 'Failed to read local',
        issues: [],
        stats: { productionSize: 0, localSize: 0, sizeDifference: 0, linksDiff: 0, headingsDiff: 0 },
      })
      results.summary.failures++
      console.log('  FAILURE')
      continue
    }

    const comparison = compareHtml(productionHtml, localHtml, path)
    results.details.push(comparison)

    switch (comparison.status) {
      case 'match':
        results.summary.matches++
        console.log('  MATCH')
        break
      case 'minor_differences':
        results.summary.minorDifferences++
        console.log(`  MINOR (${comparison.issues.length} issues)`)
        break
      case 'error':
        results.summary.errors++
        console.log(`  ERROR (${comparison.issues.length} issues)`)
        break
    }

    for (const issue of comparison.issues) {
      console.log(`    - ${issue.type}: ${issue.detail || issue.production || ''}`)
    }
  }

  await writeFile(RESULTS_PATH, JSON.stringify(results, null, 2))

  console.log('\n' + '='.repeat(50))
  console.log(`Total: ${results.summary.total}`)
  console.log(`Matches: ${results.summary.matches}`)
  console.log(`Minor: ${results.summary.minorDifferences}`)
  console.log(`Errors: ${results.summary.errors}`)
  console.log(`Failures: ${results.summary.failures}`)
  console.log(`\nResults: ${RESULTS_PATH}`)

  if (results.summary.failures > 0 || results.summary.errors > 0) {
    process.exit(1)
  }
}

runComparison().catch((error) => {
  console.error('Comparison failed:', error)
  process.exit(1)
})
