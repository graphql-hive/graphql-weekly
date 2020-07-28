"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_lambda_1 = require("apollo-server-lambda");
const schema_1 = require("../schema");
const context_1 = require("../context");
// dev
// new ApolloServer({ schema, context: createContext }).listen(
//   { port: 4000 },
//   () =>
//     console.log(
//       `🚀 Server ready at: http://localhost:4000\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
//     ),
// )
// prod..
const server = new apollo_server_lambda_1.ApolloServer({ schema: schema_1.schema, context: context_1.createContext });
exports.handler = server.createHandler();
//# sourceMappingURL=index.js.map