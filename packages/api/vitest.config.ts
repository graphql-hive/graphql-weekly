import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: await readD1Migrations('migrations'),
            LOCAL_DEV: 'true',
          },
          d1Databases: ['graphqlweekly'],
        },
        wrangler: { configPath: './wrangler.jsonc' },
      },
    },
    setupFiles: ['./src/test-setup.ts'],
  },
})
