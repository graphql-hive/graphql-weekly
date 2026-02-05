#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Seed staging D1 with production data.
 * Copies content tables only - auth tables (account, session, verification, user)
 * are excluded since staging uses a separate OAuth app.
 *
 * Usage:
 *   bun run scripts/seed-staging.ts
 *   bun run scripts/seed-staging.ts --dry-run  # Preview without writing
 */

import { $ } from 'bun'
import { unlinkSync, writeFileSync } from 'node:fs'

const PROD_DB = 'graphqlweekly'
const STAGING_DB = 'graphql-weekly-staging'

// Content tables in dependency order (Author ← Issue ← Topic ← Link)
const CONTENT_TABLES = [
  'Issue',
  'Topic',
  'Link',
  'Subscriber',
  'LinkSubmission',
  'AllowedEmail',
  'AllowedOrg',
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  console.log('Seeding staging D1 from production...\n')

  // Export production data
  const exportFile = '/tmp/prod-export.sql'
  console.log('Exporting production database...')
  await $`bunx wrangler d1 export ${PROD_DB} --remote --output ${exportFile} --no-schema`
  console.log('Export complete.\n')

  // Read and filter to content tables only
  const exportContent = await Bun.file(exportFile).text()

  // Build regex pattern for content tables (no global flag to avoid state issues)
  const tablePattern = CONTENT_TABLES.join('|')
  const insertRegex = new RegExp(`^INSERT INTO "(${tablePattern})"`)

  // Filter lines and convert to INSERT OR REPLACE
  const lines = exportContent.split('\n')
  const filteredLines = lines
    .filter((line) => insertRegex.test(line))
    .map((line) => line.replace(/^INSERT INTO/, 'INSERT OR REPLACE INTO'))

  // Count by table
  const counts: Record<string, number> = {}
  for (const line of filteredLines) {
    const match = line.match(/^INSERT OR REPLACE INTO "(\w+)"/)
    if (match) {
      counts[match[1]] = (counts[match[1]] || 0) + 1
    }
  }

  console.log('Content to import:')
  for (const table of CONTENT_TABLES) {
    console.log(`  ${table}: ${counts[table] || 0} rows`)
  }

  if (dryRun) {
    console.log('\nDry run complete.')
    return
  }

  // Import in dependency order with FK disabled
  console.log('\nImporting to staging...')

  for (const table of CONTENT_TABLES) {
    const tableLines = filteredLines.filter((line) =>
      line.startsWith(`INSERT OR REPLACE INTO "${table}"`),
    )

    if (tableLines.length === 0) {
      console.log(`  ${table}: skipped (no data)`)
      continue
    }

    const seedFile = `/tmp/seed-${table}.sql`
    writeFileSync(
      seedFile,
      `PRAGMA foreign_keys = OFF;\n${tableLines.join('\n')}`,
    )

    try {
      process.stdout.write(`  ${table}: ${tableLines.length} rows...`)
      await $`bunx wrangler d1 execute ${STAGING_DB} --remote --file=${seedFile}`.quiet()
      console.log(' done')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.log(` failed (${msg.slice(0, 40)})`)
    } finally {
      unlinkSync(seedFile)
    }
  }

  console.log('\nStaging database seeded.')
  console.log('Note: Auth tables (user, account, session) were not copied.')
  console.log('Users must log in via the staging OAuth app.')
}

await main()
