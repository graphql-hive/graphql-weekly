require('dotenv').config()
import { ApolloServer } from 'apollo-server-lambda'
import { schema } from '../schema'
import { createContext } from '../context'

// dev
// new ApolloServer({ schema, context: ({ req }) => createContext(req) }).listen(
//   { port: 4000 },
//   () =>
//     console.log(
//       `🚀 Server ready at: http://localhost:4000\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`
//     )
// )

// prod..
const server = new ApolloServer({
  schema,
  context: ({ req }) => createContext(req),
})
exports.handler = server.createHandler({
  cors: {
    origin: '*',
  },
})
