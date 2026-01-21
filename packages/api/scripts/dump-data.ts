/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */
// @ts-expect-error - prisma not installed, script for legacy db dump
import { PrismaClient } from '@prisma/client'
import { mkdirSync, writeFileSync } from 'node:fs'

const prisma = new PrismaClient()

async function main() {
  const outDir = './data-dump'
  mkdirSync(outDir, { recursive: true })

  console.log('Dumping data...')

  const authors = await prisma.author.findMany()
  console.log(`  Authors: ${authors.length}`)
  writeFileSync(`${outDir}/authors.json`, JSON.stringify(authors, null, 2))

  const issues = await prisma.issue.findMany()
  console.log(`  Issues: ${issues.length}`)
  writeFileSync(`${outDir}/issues.json`, JSON.stringify(issues, null, 2))

  const topics = await prisma.topic.findMany()
  console.log(`  Topics: ${topics.length}`)
  writeFileSync(`${outDir}/topics.json`, JSON.stringify(topics, null, 2))

  const links = await prisma.link.findMany()
  console.log(`  Links: ${links.length}`)
  writeFileSync(`${outDir}/links.json`, JSON.stringify(links, null, 2))

  const linkSubmissions = await prisma.linkSubmission.findMany()
  console.log(`  LinkSubmissions: ${linkSubmissions.length}`)
  writeFileSync(
    `${outDir}/link-submissions.json`,
    JSON.stringify(linkSubmissions, null, 2),
  )

  const subscribers = await prisma.subscriber.findMany()
  console.log(`  Subscribers: ${subscribers.length}`)
  writeFileSync(
    `${outDir}/subscribers.json`,
    JSON.stringify(subscribers, null, 2),
  )

  const users = await prisma.user.findMany()
  console.log(`  Users: ${users.length}`)
  writeFileSync(`${outDir}/users.json`, JSON.stringify(users, null, 2))

  console.log(`\nData dumped to ${outDir}/`)
}

let returnCode = 0

try {
  await main()
} catch (error) {
  returnCode = 1
  console.error(error)
} finally {
  await prisma.$disconnect()
}

process.exit(returnCode)
