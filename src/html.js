import PropTypes from 'prop-types'
import React from 'react'

export default class HTML extends React.Component {
  render() {
    return (
      <html {...this.props.htmlAttributes}>
        <head>
          <title>GraphQL Weekly</title>
          <meta charSet="utf-8" />
          <meta content="ie=edge" httpEquiv="x-ua-compatible" />
          <meta
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
            name="viewport"
          />

          <link
            href="https://fonts.googleapis.com/css?family=Rubik:400,500,700"
            rel="stylesheet"
          />

          {/* Favicons */}
          <link
            href="/favicons/apple-touch-icon.png"
            rel="apple-touch-icon"
            sizes="180x180"
          />
          <link
            href="/favicons/favicon-32x32.png"
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="/favicons/favicon-16x16.png"
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
          <link href="/favicons/site.webmanifest" rel="manifest" />
          <link
            color="#0c344b"
            href="/favicons/safari-pinned-tab.svg"
            rel="mask-icon"
          />
          <meta content="GraphQL Weekly" name="apple-mobile-web-app-title" />
          <meta content="GraphQL Weekly" name="application-name" />
          <meta content="#0c344b" name="msapplication-TileColor" />
          <meta content="#ffffff" name="theme-color" />

          {this.props.headComponents}
        </head>
        <body {...this.props.bodyAttributes}>
          {this.props.preBodyComponents}
          <div
            dangerouslySetInnerHTML={{ __html: this.props.body }}
            id="___gatsby"
            key={`body`}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  }
}

HTML.propTypes = {
  body: PropTypes.string,
  bodyAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  htmlAttributes: PropTypes.object,
  postBodyComponents: PropTypes.array,
  preBodyComponents: PropTypes.array,
}
