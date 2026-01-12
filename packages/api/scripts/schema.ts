import { schema } from '../api/schema'
import { join } from 'path'
import { writeFileSync } from 'fs'
import { printSchema } from 'graphql'

writeFileSync(join(__dirname, '../schema.graphql'), printSchema(schema))
