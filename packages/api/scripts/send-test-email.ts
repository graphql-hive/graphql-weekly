#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * @file Sends a test email using Resend
 *
 * Usage:
 *   bun run email:test
 *   bun run email:test --to other@example.com
 *
 * Setup:
 *   1. Sign up at https://resend.com (free: 100 emails/day)
 *   2. Get your API key from https://resend.com/api-keys
 *   3. Add to .dev.vars:
 *      RESEND_API_KEY=re_xxx
 *      RESEND_TEST_EMAIL=your-resend-account@example.com
 *
 * Note: Without domain verification, you can only send to your Resend account email.
 */

import { render } from '@react-email/components'
import { file } from 'bun'
import { Resend } from 'resend'

import { Newsletter } from '../src/email'
import { issue399 } from '../src/email/templates/newsletter.fixture'

async function loadDevVars(): Promise<Record<string, string>> {
  const vars: Record<string, string> = {}
  try {
    const content = await file('.dev.vars').text()
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex)
      const value = trimmed.slice(eqIndex + 1)
      vars[key] = value
    }
  } catch {
    // .dev.vars doesn't exist, that's fine
  }
  return vars
}

async function main() {
  const devVars = await loadDevVars()
  const apiKey = process.env.RESEND_API_KEY || devVars.RESEND_API_KEY
  const defaultTo = process.env.RESEND_TEST_EMAIL || devVars.RESEND_TEST_EMAIL

  const args = process.argv.slice(2)
  const toIndex = args.indexOf('--to')
  const to = toIndex === -1 ? defaultTo : args[toIndex + 1]

  if (!apiKey) {
    console.error('Error: RESEND_API_KEY not found in .dev.vars')
    console.error('Get your API key at https://resend.com/api-keys')
    process.exit(1)
  }

  if (!to) {
    console.error('Error: No recipient. Either:')
    console.error('  - Add RESEND_TEST_EMAIL=your@email.com to .dev.vars')
    console.error('  - Or use: bun run email:test --to your@email.com')
    process.exit(1)
  }

  const resend = new Resend(apiKey)

  console.log(`Rendering email template...`)
  const html = await render(Newsletter(issue399))

  console.log(`Sending test email to ${to}...`)

  const { data, error } = await resend.emails.send({
    from: 'GraphQL Weekly Test <onboarding@resend.dev>',
    html,
    replyTo: 'hello@graphqlweekly.com',
    subject: `[TEST] GraphQL Weekly - Issue ${issue399.issueNumber}`,
    to: [to],
  })

  if (error) {
    console.error('Failed to send email:', error)
    process.exit(1)
  }

  console.log('Email sent successfully!')
  console.log('Email ID:', data?.id)
}

await main()
