module.exports = {
  siteMetadata: {
    siteName: `GraphQL Weekly`,
    siteUrl: 'https://graphqlweekly.com',
  },

  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-125823364-3",
      },
    },
  ],
}
