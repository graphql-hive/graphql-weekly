#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Dump data from D1 database to JSON files
 *
 * Usage:
 *   bun run scripts/dump-d1.ts --local    # Dump from local D1
 *   bun run scripts/dump-d1.ts --remote   # Dump from remote D1
 */

import { $ } from 'bun'
import { mkdirSync, writeFileSync } from 'node:fs'

const DATA_DIR = './data-dump'
const DB_NAME = 'graphqlweekly'

const TABLES = [
  'Author',
  'Issue',
  'Topic',
  'Link',
  'Subscriber',
  'LinkSubmission',
  'AllowedEmail',
  'AllowedOrg',
]

async function main() {
  const isRemote = process.argv.includes('--remote')
  const locationFlag = isRemote ? '--remote' : '--local'

  console.log(`Dumping data from ${isRemote ? 'remote' : 'local'} D1...`)

  mkdirSync(DATA_DIR, { recursive: true })

  for (const table of TABLES) {
    try {
      const result =
        await $`bunx wrangler d1 execute ${DB_NAME} ${locationFlag} --json --command="SELECT * FROM ${table}"`.quiet()
      const output = JSON.parse(result.stdout.toString())
      const rows = output[0]?.results || []
      console.log(`  ${table}: ${rows.length} rows`)

      const filename = table
        .replaceAll(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()
      writeFileSync(
        `${DATA_DIR}/${filename}.json`,
        JSON.stringify(rows, null, 2),
      )
    } catch {
      console.log(`  ${table}: skipped (table may not exist)`)
    }
  }

  console.log(`\nData dumped to ${DATA_DIR}/`)
}

await main()
