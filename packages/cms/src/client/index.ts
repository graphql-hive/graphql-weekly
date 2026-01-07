import ApolloClient from 'apollo-boost'

const headers = {
  Authorization:
    'JWT_TOKEN_REDACTED'
}

export default new ApolloClient({
  uri: 'https://graphqlweekly-api.netlify.app/.netlify/functions/graphql',
  request: async (operation) => {
    operation.setContext({ headers })
  }
})
