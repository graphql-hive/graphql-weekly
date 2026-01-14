import { applyD1Migrations, env } from 'cloudflare:test'

await applyD1Migrations(
  env.graphqlweekly,
  env.TEST_MIGRATIONS as Parameters<typeof applyD1Migrations>[1],
)
