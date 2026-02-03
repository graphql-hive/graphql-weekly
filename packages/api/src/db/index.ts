import type { D1Database } from '@cloudflare/workers-types'

import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

import type { Database } from './types'

export function createDb(d1: D1Database): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  })
}

export type { Database } from './types'
export * from './types'
