#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * @file Adds an email to the AllowedEmail table
 *
 * We add CMS editors by org access or email allowlist.
 *
 * Usage:
 *   bun run scripts/add-allowed-email.ts user@example.com --local
 *   bun run scripts/add-allowed-email.ts user@example.com --remote
 *   bun run scripts/add-allowed-email.ts user@example.com --staging
 */

import { $ } from 'bun'

const DB_NAME = 'graphqlweekly'

// Simple email validation - rejects injection attempts
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

async function main() {
  const args = process.argv.slice(2)
  const email = args.find((arg) => !arg.startsWith('--'))
  const isRemote = args.includes('--remote')
  const isLocal = args.includes('--local')
  const isStaging = args.includes('--staging')

  if (!email) {
    console.error(
      'Usage: bun run scripts/add-allowed-email.ts <email> --local|--remote|--staging',
    )
    process.exit(1)
  }

  if (!EMAIL_REGEX.test(email)) {
    console.error('Invalid email format')
    process.exit(1)
  }

  const flagCount = [isRemote, isLocal, isStaging].filter(Boolean).length
  if (flagCount !== 1) {
    console.error('Specify exactly one of --local, --remote, or --staging')
    process.exit(1)
  }

  const wranglerFlags = isStaging
    ? ['--env', 'preview', '--remote']
    : isRemote
      ? ['--remote']
      : ['--local']
  const label = isStaging ? 'staging' : isRemote ? 'remote' : 'local'
  const escapedEmail = email.replaceAll("'", "''")
  const sql = `INSERT OR IGNORE INTO AllowedEmail (email) VALUES ('${escapedEmail}')`

  console.log(`Adding ${email} to ${label} AllowedEmail...`)

  try {
    await $`bunx wrangler d1 execute ${DB_NAME} ${wranglerFlags} --command=${sql}`.quiet()
    console.log('Done.')
  } catch (error) {
    console.error('Failed:', error)
    process.exit(1)
  }
}

await main()
