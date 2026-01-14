import { describe, it, expect, beforeAll } from 'vitest'
import { env, SELF } from 'cloudflare:test'

describe('GraphQL API', () => {
  beforeAll(async () => {
    // Run migrations - D1 exec requires single statements
    await env.graphqlweekly.exec(
      `CREATE TABLE IF NOT EXISTS Issue (id TEXT PRIMARY KEY, authorId TEXT, comment TEXT, date TEXT NOT NULL, description TEXT, number INTEGER NOT NULL UNIQUE, previewImage TEXT, published INTEGER NOT NULL DEFAULT 0, specialPerk TEXT, title TEXT NOT NULL, versionCount INTEGER NOT NULL DEFAULT 0)`,
    )
  })

  it('should respond to health check', async () => {
    const response = await SELF.fetch('http://localhost/health')
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('OK')
  })

  it('should return empty issues list', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ allIssues { id title } }' }),
    })
    const data = await response.json()
    expect(data).toEqual({ data: { allIssues: [] } })
  })

  it('should create and query an issue', async () => {
    // Create issue
    const createResponse = await SELF.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation {
          createIssue(title: "Test Issue", number: 1, published: false) {
            id title number published
          }
        }`,
      }),
    })
    const createData = (await createResponse.json()) as {
      data: {
        createIssue: {
          id: string
          title: string
          number: number
          published: boolean
        }
      }
    }
    expect(createData.data.createIssue.title).toBe('Test Issue')
    expect(createData.data.createIssue.number).toBe(1)
    expect(createData.data.createIssue.published).toBe(false)

    // Query issues
    const queryResponse = await SELF.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ allIssues { id title number } }' }),
    })
    const queryData = (await queryResponse.json()) as {
      data: { allIssues: Array<{ title: string }> }
    }
    expect(queryData.data.allIssues).toHaveLength(1)
    expect(queryData.data.allIssues[0].title).toBe('Test Issue')
  })
})
