import { env, SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'

const TEST_USER_ID = 'test-user-id'

async function ensureTestUser() {
  const db = env.graphqlweekly
  const now = new Date().toISOString()
  await db.prepare(
    `INSERT OR REPLACE INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(TEST_USER_ID, 'Test User', 'test@example.com', 0, now, now).run()
}

describe('GraphQL API', () => {
  beforeEach(async () => {
    const db = env.graphqlweekly
    await db.exec(`DELETE FROM Issue; DELETE FROM Topic; DELETE FROM Link;`)
  })

  it('should respond to health check', async () => {
    const response = await SELF.fetch('http://localhost/health')
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('OK')
  })

  it('should return empty issues list', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({ query: '{ allIssues { id title } }' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const data = await response.json()
    expect(data).toEqual({ data: { allIssues: [] } })
  })

  it('should reject mutations when not authenticated', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({
        query: `mutation { createIssue(title: "Test", number: 1, published: false) { id } }`,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const data = (await response.json()) as { errors?: { message: string; extensions?: { code: string } }[] }
    expect(data.errors).toBeDefined()
    expect(data.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  it('should create and query an issue when authenticated', async () => {
    await ensureTestUser()
    const createResponse = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({
        query: `mutation {
          createIssue(title: "Test Issue", number: 1, published: false) {
            id title number published
          }
        }`,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': TEST_USER_ID,
      },
      method: 'POST',
    })
    const createData = (await createResponse.json()) as {
      data: {
        createIssue: {
          id: string
          number: number
          published: boolean
          title: string
        }
      }
    }
    expect(createData.data.createIssue.title).toBe('Test Issue')
    expect(createData.data.createIssue.number).toBe(1)
    expect(createData.data.createIssue.published).toBe(false)

    const queryResponse = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({ query: '{ allIssues { id title number } }' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const queryData = (await queryResponse.json()) as {
      data: { allIssues: { title: string }[] }
    }
    expect(queryData.data.allIssues).toHaveLength(1)
    expect(queryData.data.allIssues[0].title).toBe('Test Issue')
  })
})
