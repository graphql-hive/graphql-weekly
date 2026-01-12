import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import AuthPlugin from '@pothos/plugin-scope-auth'
import { db } from './db'
import type { Context } from './context'
import { DateTimeResolver } from 'graphql-scalars'

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  AuthScopes: { loggedIn: boolean }
  Context: Context
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
    ID: {
      Input: string
      Output: string | number
    }
  }
}>({
  plugins: [AuthPlugin, PrismaPlugin],
  prisma: {
    client: db,
  },
  authScopes: (ctx) => ({
    loggedIn: !!ctx.user,
  }),
})

builder.addScalarType('DateTime', DateTimeResolver, {})
