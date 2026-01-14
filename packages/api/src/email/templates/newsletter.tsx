import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export const colorMap: Record<string, string> = {
  articles: '#f531b1',
  'community & events': '#009BE3',
  conference: '#6560E2',
  default: '#f531b1',
  'open source': '#F0950C',
  'tools & open source': '#F0950C',
  tutorials: '#6560E2',
  videos: '#27AE60',
}

function getColor(title: string): string {
  return colorMap[title.toLowerCase()] || colorMap.default
}

export interface NewsletterLink {
  text: string
  title: string
  url: string
}

export interface NewsletterTopic {
  links: NewsletterLink[]
  title: string
}

export interface NewsletterProps {
  isFoundationEdition?: boolean
  issueTitle: string
  topics: NewsletterTopic[]
}

function TopicSection({ topic }: { topic: NewsletterTopic }) {
  const color = getColor(topic.title)

  return (
    <Section style={{ marginBottom: '16px' }}>
      <Row>
        <Column
          style={{ backgroundColor: color, borderRadius: '8px 0 0 8px' }}
          width={8}
        />
        <Column
          style={{
            ...styles.articleBoxContent,
            backgroundColor: '#f6f6f7',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <Text style={{ ...styles.articleTitle, color }}>{topic.title}</Text>
          {topic.links.map((link, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div style={styles.hr} />}
              <Link
                href={link.url}
                style={{ color: '#081146', textDecoration: 'none' }}
              >
                <Text style={styles.linkTitle}>{link.title}</Text>
              </Link>
              <Text style={styles.linkText}>{link.text}</Text>
            </React.Fragment>
          ))}
        </Column>
      </Row>
    </Section>
  )
}

function FoundationHeader() {
  return (
    <Section style={{ marginBottom: '10px' }}>
      <Text style={{ ...styles.articleTitle, color: '#f531b1' }}>
        Welcome to GraphQL Weekly: Foundation Edition!
      </Text>
      <Text style={styles.bodyText}>
        Prisma is a part of the GraphQL Foundation and they have partnered with
        the{' '}
        <Link
          href="https://foundation.graphql.org/news/graphql-newsletter/"
          style={styles.link}
        >
          foundation's new newsletter
        </Link>{' '}
        to bring you the latest Foundation news.
      </Text>
      <Section style={styles.foundationBox}>
        <Text style={styles.foundationText}>
          <em>
            The{' '}
            <Link
              href="https://foundation.graphql.org/faq/"
              style={styles.link}
            >
              GraphQL Foundation
            </Link>{' '}
            provides governance for GraphQL as well as vendor-neutral oversight
            of funding, events, operations resources, and more. It was formed in
            2018 by{' '}
            <Link
              href="https://landscape.graphql.org/category=graph-ql-foundation-member&format=logo-mode"
              style={styles.link}
            >
              various tech companies
            </Link>{' '}
            and hosted under the{' '}
            <Link href="https://www.linuxfoundation.org/" style={styles.link}>
              Linux Foundation
            </Link>
            . It's an open, neutral home for the GraphQL community.
          </em>
        </Text>
        <Text style={styles.foundationText}>
          <em>
            You can find out more by visiting{' '}
            <Link href="https://foundation.graphql.org/" style={styles.link}>
              foundation.graphql.org
            </Link>
          </em>
        </Text>
      </Section>
    </Section>
  )
}

function FoundationFooter() {
  return (
    <Section style={{ padding: '10px 30px' }}>
      <Text style={styles.footerTitle}>Get Involved!</Text>
      <Text style={styles.bodyText}>
        Developers can get involved in the community and contribute to the
        project at{' '}
        <Link href="https://github.com/graphql" style={styles.link}>
          https://github.com/graphql
        </Link>
        .
      </Text>
      <Text style={styles.bodyText}>
        Organizations interested in becoming members of the GraphQL Foundation
        or the GraphQL Specification can learn more on our{' '}
        <Link href="https://foundation.graphql.org/join/" style={styles.link}>
          member page
        </Link>
        . If you have questions about membership, please send an email to{' '}
        <Link href="mailto:membership@graphql.org" style={styles.link}>
          membership@graphql.org
        </Link>
        .
      </Text>
    </Section>
  )
}

export function Newsletter({
  isFoundationEdition = false,
  issueTitle,
  topics,
}: NewsletterProps) {
  const firstTopic = topics[0]
  const restTopics = topics.slice(1)
  const firstTopicColor = firstTopic
    ? getColor(firstTopic.title)
    : colorMap.default

  return (
    <Html>
      <Head>
        <Font
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          fontFamily="Rubik"
          fontStyle="normal"
          fontWeight={400}
          webFont={{
            format: 'woff2',
            url: 'https://fonts.googleapis.com/css?family=Rubik:400,500,700',
          }}
        />
      </Head>
      <Preview>GraphQL Weekly - {issueTitle}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Row>
              <Column>
                <Row>
                  <Column width={55}>
                    <Img
                      alt="GraphQL Weekly"
                      height={55}
                      src="https://graphqlweekly.com/assets/WeeklyLogo.png"
                      width={55}
                    />
                  </Column>
                  <Column style={{ paddingLeft: '6px' }}>
                    <Text style={styles.logoTitle}>GraphQL</Text>
                    <Text style={styles.logoSubtitle}>Weekly</Text>
                  </Column>
                </Row>
              </Column>
              <Column align="right">
                <Link href="*|LIST:URL|*" style={styles.viewLink}>
                  <Text style={styles.viewLinkText}>View in browser</Text>
                </Link>
              </Column>
            </Row>
          </Section>

          {/* First Topic Box */}
          {firstTopic && (
            <Section
              style={{ ...styles.articleBox, borderRadius: '0 0 9px 9px' }}
            >
              <Row>
                <Column
                  style={{
                    backgroundColor: firstTopicColor,
                    borderRadius: '8px 0 0 8px',
                  }}
                  width={8}
                />
                <Column
                  style={{ ...styles.articleBoxContent, paddingTop: '32px' }}
                >
                  <Section
                    style={{ marginBottom: '32px', textAlign: 'center' }}
                  >
                    <Text style={styles.issueTag}>
                      GraphQL Weekly - {issueTitle}
                    </Text>
                  </Section>

                  {isFoundationEdition && <FoundationHeader />}

                  <Text
                    style={{ ...styles.articleTitle, color: firstTopicColor }}
                  >
                    {firstTopic.title}
                  </Text>
                  {firstTopic.links.map((link, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <div style={styles.hr} />}
                      <Link
                        href={link.url}
                        style={{ color: '#081146', textDecoration: 'none' }}
                      >
                        <Text style={styles.linkTitle}>{link.title}</Text>
                      </Link>
                      <Text style={styles.linkText}>{link.text}</Text>
                    </React.Fragment>
                  ))}
                </Column>
              </Row>
            </Section>
          )}

          {/* Rest of Topics */}
          <Section style={{ paddingTop: '16px' }}>
            {restTopics.map((topic, index) => (
              <TopicSection key={index} topic={topic} />
            ))}
          </Section>

          {/* Stellate Banner */}
          <Section style={styles.bannerBox}>
            <Link href="https://stellate.co/">
              <Img
                alt="Stellate"
                height={340}
                src="https://imgur.com/ihcMKzO.png"
                style={{ height: 'auto', maxWidth: '100%' }}
                width={680}
              />
            </Link>
          </Section>

          {isFoundationEdition && <FoundationFooter />}

          {/* Footer Links */}
          <Section style={{ marginTop: '64px', textAlign: 'center' }}>
            <Link
              href="https://www.graphqlweekly.com/"
              style={styles.footerLink}
            >
              View all issues
            </Link>
            <Link
              href="https://twitter.com/graphqlweekly"
              style={styles.footerLink}
            >
              Follow on Twitter
            </Link>
            <Link href="https://slack.prisma.io/" style={styles.footerLink}>
              Join us on Slack
            </Link>
          </Section>

          {/* Footer Text */}
          <Section style={{ padding: '42px 0 64px', textAlign: 'center' }}>
            <Text style={styles.footerText}>
              If you were forwarded this newsletter and you like it, you can{' '}
              <Link
                href="https://graphqlweekly.com/"
                style={styles.footerTextLink}
              >
                subscribe here
              </Link>
              .
            </Text>
            <Text style={styles.footerText}>
              If you don't want these updates anymore, you can{' '}
              <Link href="*|UNSUB|*" style={styles.footerTextLink}>
                unsubscribe here
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  articleBox: {
    backgroundColor: '#f6f6f7',
    boxShadow: '0px 4px 16px rgba(8, 17, 70, 0.05)',
  },
  articleBoxContent: {
    padding: '48px 48px 48px 40px',
  },
  articleTitle: {
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '18px',
    margin: '0 0 32px 0',
    textTransform: 'uppercase' as const,
  },
  bannerBox: {
    backgroundColor: '#f6f6f7',
    borderRadius: '8px',
    boxShadow: '0px 4px 16px rgba(8, 17, 70, 0.05)',
    marginTop: '16px',
    overflow: 'hidden',
  },
  body: {
    backgroundColor: '#E5E5E5',
    fontFamily:
      '"Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
  },
  bodyText: {
    color: '#081146',
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: '1.75',
    margin: '0 0 16px 0',
  },
  container: {
    margin: '0 auto',
    maxWidth: '680px',
  },
  footerLink: {
    color: '#081146',
    display: 'inline-block',
    fontSize: '18px',
    fontWeight: 500,
    marginLeft: '33px',
    textDecoration: 'none',
  },
  footerText: {
    color: '#698391',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 8px 0',
  },
  footerTextLink: {
    color: '#698391',
    textDecoration: 'underline',
  },
  footerTitle: {
    fontSize: '20px',
    fontWeight: 500,
    margin: '0 0 16px 0',
  },
  foundationBox: {
    backgroundColor: '#eaeaea',
    borderRadius: '10px',
    margin: '10px 0 30px',
    padding: '10px 20px',
  },
  foundationText: {
    color: '#081146',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '8px 0',
  },
  header: {
    backgroundColor: '#D60690',
    padding: '40px 20px 25px',
  },
  hr: {
    borderTop: '1px solid rgb(197, 200, 220)',
    margin: '40px 0',
  },
  issueTag: {
    backgroundColor: '#6560e2',
    borderRadius: '32px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '16px',
    margin: 0,
    padding: '9px 12px',
    textTransform: 'uppercase' as const,
  },
  link: {
    color: '#D60690',
    textDecoration: 'underline',
  },
  linkText: {
    color: '#081146',
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: '1.75',
    margin: '24px 0 0 0',
  },
  linkTitle: {
    color: '#081146',
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: '1.33',
    margin: 0,
    textDecoration: 'none',
  },
  logoSubtitle: {
    color: '#ffffff',
    fontSize: '25px',
    fontWeight: 'bold' as const,
    letterSpacing: '-0.02em',
    lineHeight: '25px',
    margin: 0,
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '15px',
    margin: 0,
  },
  viewLink: {
    textDecoration: 'none',
  },
  viewLinkText: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 500,
    margin: 0,
  },
} as const

export default Newsletter
