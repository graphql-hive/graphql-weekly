import ApolloClient from 'apollo-boost';

const headers = {
  Authorization:
    'JWT_TOKEN_REDACTED'
};

// Pass your GraphQL endpoint to uri
export default new ApolloClient({
  uri: 'https://graphqlweekly-api.netlify.app/.netlify/functions/graphql',
  // uri: 'http://localhost:8888/.netlify/functions/graphql',
  request: (operation) => {
    operation.setContext({
      headers
    });
  }
});
