/// <reference types="@cloudflare/workers-types" />
/// <reference types="@cloudflare/vitest-pool-workers" />
import type { Env } from './worker'

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[]
  }
}
