#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Import script for D1 database
 * Reads JSON dumps from data-dump/ and imports into D1
 *
 * Usage:
 *   bun run scripts/import-data.ts --local    # Import to local D1
 *   bun run scripts/import-data.ts --remote   # Import to remote D1
 */

import { $ } from 'bun'
import { existsSync, readFileSync } from 'node:fs'

const DATA_DIR = './data-dump'
const DB_NAME = 'graphqlweekly'

interface ImportConfig {
  columns: string[]
  file: string
  table: string
}

const TABLES: ImportConfig[] = [
  {
    columns: [
      'id',
      'avatarUrl',
      'name',
      'description',
      'createdAt',
      'updatedAt',
    ],
    file: 'authors.json',
    table: 'Author',
  },
  {
    columns: [
      'id',
      'authorId',
      'comment',
      'date',
      'description',
      'number',
      'previewImage',
      'published',
      'specialPerk',
      'title',
      'versionCount',
    ],
    file: 'issues.json',
    table: 'Issue',
  },
  {
    columns: ['id', 'issueId', 'issue_comment', 'position', 'title'],
    file: 'topics.json',
    table: 'Topic',
  },
  {
    columns: ['id', 'position', 'text', 'title', 'topicId', 'url'],
    file: 'links.json',
    table: 'Link',
  },
  {
    columns: ['id', 'email', 'name'],
    file: 'subscribers.json',
    table: 'Subscriber',
  },
  {
    columns: [
      'id',
      'createdAt',
      'updatedAt',
      'description',
      'email',
      'name',
      'title',
      'url',
    ],
    file: 'link-submissions.json',
    table: 'LinkSubmission',
  },
  {
    columns: ['id', 'roles'],
    file: 'users.json',
    table: 'User',
  },
]

function escapeValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString()}'`
  const str = String(value)
    .replaceAll("'", "''")
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
  return `'${str}'`
}

function generateInsertSQL(
  config: ImportConfig,
  data: Record<string, unknown>[],
): string {
  if (data.length === 0) return ''

  const lines: string[] = []
  for (const row of data) {
    const values = config.columns.map((col) => escapeValue(row[col]))
    lines.push(
      `INSERT INTO ${config.table} (${config.columns.join(', ')}) VALUES (${values.join(', ')});`,
    )
  }
  return lines.join('\n')
}

async function main() {
  const isRemote = process.argv.includes('--remote')
  const locationFlag = isRemote ? '--remote' : '--local'

  console.log(`Importing data to ${isRemote ? 'remote' : 'local'} D1...`)

  if (!existsSync(DATA_DIR)) {
    console.error(`Data directory not found: ${DATA_DIR}`)
    console.error('Run the dump script first to export data from MySQL.')
    process.exit(1)
  }

  for (const config of TABLES) {
    const filePath = `${DATA_DIR}/${config.file}`

    if (!existsSync(filePath)) {
      console.log(`  Skipping ${config.table}: ${config.file} not found`)
      continue
    }

    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    console.log(`  Importing ${data.length} ${config.table} records...`)

    if (data.length === 0) continue

    const sql = generateInsertSQL(config, data)
    const tmpFile = `/tmp/import_${config.table}.sql`
    Bun.write(tmpFile, sql)

    try {
      await $`npx wrangler d1 execute ${DB_NAME} ${locationFlag} --file=${tmpFile}`.quiet()
      console.log(`    ✓ ${config.table} imported`)
    } catch (error) {
      console.error(`    ✗ Failed to import ${config.table}:`, error)
    }
  }

  console.log('\nImport complete!')
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
