import { createAuthClient } from 'better-auth/react'

const baseURL = import.meta.env.DEV
  ? 'http://localhost:2012'
  : (import.meta.env.PUBLIC_API_URL || 'https://api.graphqlweekly.com')

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL,
})

export const { signIn, signOut, useSession } = authClient
