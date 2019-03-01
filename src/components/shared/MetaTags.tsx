import * as React from 'react'
import Helmet from 'react-helmet'

const defaults = {
  title: 'GraphQL Weekly - Newsletter about GraphQL, Apollo and more',
  description:
    'A weekly newsletter of the best news, articles and projects about GraphQL',
  image: 'https://www.graphqlweekly.com/og-image.png',
  url: 'https://www.graphqlweekly.com',
}

type Props = {
  title?: string
  description?: string
  image?: string
  video?: string
  url?: string
}

export const MetaTags = ({
  title,
  description,
  image,
  video,
  url,
}: Props = defaults) => {
  image = image || defaults.image
  description = description || defaults.description
  url = url || defaults.url
  title = title || defaults.title
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="image" content={image} />
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@graphqlweekly" />
      <meta name="twitter:creator" content="@graphqlweekly" />
      <meta name="twitter:image:src" content={image} />
      <meta name="og:title" content={title} />
      <meta name="og:description" content={description} />
      <meta name="og:image" content={image} />
      <meta
        name="og:url"
        content={typeof location !== 'undefined' ? location.href : url}
      />
      <meta name="og:site_name" content="GraphQL Weekly" />
      <meta name="og:type" content="website" />
    </Helmet>
  )
}
