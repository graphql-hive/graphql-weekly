import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('GraphQL API', () => {
  it('should respond to health check', async () => {
    const response = await SELF.fetch('http://localhost/health')
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('OK')
  })

  it('should return issues list', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({ query: '{ allIssues { id title } }' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const data = (await response.json()) as { data: { allIssues: unknown[] } }
    expect(data.data.allIssues).toBeDefined()
    expect(Array.isArray(data.data.allIssues)).toBe(true)
  })

  it('should return null for me when not authenticated', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({ query: '{ me { id isCollaborator } }' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const data = (await response.json()) as { data: { me: null } }
    expect(data.data.me).toBeNull()
  })

  it('should reject mutations when not authenticated', async () => {
    const response = await SELF.fetch('http://localhost/graphql', {
      body: JSON.stringify({
        query: `mutation { createIssue(title: "Test", number: 1, published: false) { id } }`,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const data = (await response.json()) as {
      errors?: { extensions?: { code: string }; message: string }[]
    }
    expect(data.errors).toBeDefined()
    expect(data.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })
})
