import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    poolOptions: {
      workers: {
        miniflare: {
          d1Databases: ['graphqlweekly'],
          bindings: {
            TEST_MIGRATIONS: await readD1Migrations('migrations'),
          },
        },
        wrangler: { configPath: './wrangler.jsonc' },
      },
    },
  },
})
