import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('GraphQL API', () => {
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

  it('should create and query an issue', async () => {
    // Create issue
    const createResponse = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({
        query: `mutation {
          createIssue(title: "Test Issue", number: 1, published: false) {
            id title number published
          }
        }`,
      }),
      headers: { 'Content-Type': 'application/json' },
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

    // Query issues
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
