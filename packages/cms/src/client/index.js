import ApolloClient from "apollo-boost";

// const headers = {
//   Authorization:
//     "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0Nzg4Njk1NDAsImNsaWVudElkIjoiY2lvcTk1b2VjMDJrajAxbzBvbmpvcHBmOSIsInByb2plY3RJZCI6ImNpcGIxMTFwdzVmZ3QwMW8wZTdodngybGYiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpdmRzcW9zMjBmMnEwMTQ1YnVlMDMzdzAifQ.bVe4_30gcPIqw-mbBxtRY7k3RAc_hyd0Dl_g5pB32JQ"
// };

// Pass your GraphQL endpoint to uri
export default new ApolloClient({
  uri: "https://graphqlweekly-api.netlify.app/.netlify/functions/graphql",
  request: operation => {
    operation.setContext();
  }
});
