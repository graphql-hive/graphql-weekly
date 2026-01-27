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
import { Fragment } from 'react'

import { issue399 } from './newsletter.fixture'

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
  issueDate?: string
  issueNumber: number
  /** @deprecated Use issueNumber instead */
  issueTitle?: string
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
            <Fragment key={index}>
              {index > 0 && <div style={styles.hr} />}
              <Link
                href={link.url}
                style={{ ...styles.linkTitle, display: 'block' }}
              >
                {link.title}
              </Link>
              <Text style={styles.linkText}>{link.text}</Text>
            </Fragment>
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
  issueDate,
  issueNumber,
  topics = [],
}: NewsletterProps) {
  const firstTopic = topics[0]
  const restTopics = topics.slice(1)
  const firstTopicColor = firstTopic
    ? getColor(firstTopic.title)
    : colorMap.default

  return (
    <Html>
      <Head>
        {[400, 500, 600].map((weight) => (
          <Font
            fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
            fontFamily="Rubik"
            fontStyle="normal"
            fontWeight={weight}
            key={weight}
            webFont={{
              format: 'woff2',
              url: 'https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nBrXw.woff2',
            }}
          />
        ))}
      </Head>
      <Preview>{`GraphQL Weekly - Issue ${issueNumber}`}</Preview>
      <Body style={styles.body}>
        {/* 3-column table with rowspan for Gmail-compatible overlap */}
        <table
          border={0}
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: 'collapse' }}
          width="100%"
        >
          <tbody>
            {/* Row 1: Pink header height - side cells set the pink bg width */}
            <tr style={{ height: '284px' }}>
              <td style={{ backgroundColor: '#D60690', minWidth: '10px' }}>
                &nbsp;
              </td>
              <td
                rowSpan={2}
                style={{
                  backgroundColor: '#D60690',
                  borderRadius: '0 0 9px 9px',
                  maxWidth: '680px',
                  width: '680px',
                }}
                valign="top"
              >
                {/* Header content */}
                <table
                  border={0}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ width: '100%' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '40px 0 25px' }}>
                        <table border={0} cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: 'top' }}>
                                <Img
                                  alt="GraphQL Weekly"
                                  height={55}
                                  src="https://graphqlweekly.com/assets/WeeklyLogo.png"
                                  width={55}
                                />
                              </td>
                              <td style={{ paddingLeft: '6px' }}>
                                <Text style={styles.logoTitle}>GraphQL</Text>
                                <Text style={styles.logoSubtitle}>Weekly</Text>
                              </td>
                              <td style={{ width: '100%' }}>&nbsp;</td>
                              <td style={{ verticalAlign: 'middle' }}>
                                <Link
                                  href="*|LIST:URL|*"
                                  style={styles.viewLink}
                                >
                                  View in browser
                                  <Img
                                    alt=""
                                    height={12}
                                    src="https://graphqlweekly.com/assets/Arrow.png"
                                    style={{
                                      display: 'inline-block',
                                      marginBottom: '2px',
                                      marginLeft: '10px',
                                      verticalAlign: 'middle',
                                    }}
                                    width={12}
                                  />
                                </Link>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    {/* Badge row - 3 cells with split pink/white backgrounds */}
                    <tr>
                      <td>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          style={{ width: '100%' }}
                        >
                          <tbody>
                            <tr>
                              {/* Left cell: pink top, topic color bottom (the colored border) */}
                              <td style={{ verticalAlign: 'top' }} width={8}>
                                <div
                                  style={{
                                    backgroundColor: '#D60690',
                                    height: '16px',
                                  }}
                                />
                                <div
                                  style={{
                                    backgroundColor: firstTopicColor,
                                    borderRadius: '8px 0 0 0',
                                    height: '16px',
                                  }}
                                />
                              </td>
                              {/* Center cell: pink/white gradient background, badge centered */}
                              <td
                                align="center"
                                style={{
                                  background:
                                    'linear-gradient(to bottom, #D60690 50%, #f6f6f7 50%)',
                                  height: '32px',
                                  verticalAlign: 'middle',
                                }}
                              >
                                <Text style={styles.issueTag}>
                                  Issue {issueNumber}
                                  {issueDate && (
                                    <span
                                      style={{
                                        marginLeft: '4px',
                                        opacity: 0.66,
                                      }}
                                    >
                                      • {issueDate}
                                    </span>
                                  )}
                                </Text>
                              </td>
                              {/* Right cell: pink top, white bottom with rounded corner */}
                              <td style={{ verticalAlign: 'top' }} width={8}>
                                <div
                                  style={{
                                    backgroundColor: '#D60690',
                                    height: '16px',
                                  }}
                                />
                                <div
                                  style={{
                                    backgroundColor: '#f6f6f7',
                                    borderRadius: '0 8px 0 0',
                                    height: '16px',
                                  }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    {/* First Topic Box content (no badge, no negative margin) */}
                    {firstTopic && (
                      <tr>
                        <td>
                          <table
                            border={0}
                            cellPadding={0}
                            cellSpacing={0}
                            style={{
                              backgroundColor: '#f6f6f7',
                              borderRadius: '0 0 8px 8px',
                              boxShadow: '0px 4px 16px rgba(8, 17, 70, 0.05)',
                              width: '100%',
                            }}
                          >
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    backgroundColor: firstTopicColor,
                                    borderRadius: '0 0 0 8px',
                                  }}
                                  width={8}
                                />
                                <td
                                  style={styles.articleBoxContent}
                                  valign="top"
                                >
                                  {isFoundationEdition && <FoundationHeader />}

                                  <Text
                                    style={{
                                      ...styles.articleTitle,
                                      color: firstTopicColor,
                                    }}
                                  >
                                    {firstTopic.title}
                                  </Text>
                                  {firstTopic.links.map((link, index) => (
                                    <Fragment key={index}>
                                      {index > 0 && <div style={styles.hr} />}
                                      <Link
                                        href={link.url}
                                        style={{
                                          ...styles.linkTitle,
                                          display: 'block',
                                        }}
                                      >
                                        {link.title}
                                      </Link>
                                      <Text style={styles.linkText}>
                                        {link.text}
                                      </Text>
                                    </Fragment>
                                  ))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
              <td style={{ backgroundColor: '#D60690', minWidth: '10px' }}>
                &nbsp;
              </td>
            </tr>
            {/* Row 2: Below pink header - middle cell spanned from row 1 */}
            <tr>
              <td style={{ minWidth: '10px' }}>&nbsp;</td>
              <td style={{ minWidth: '10px' }}>&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <Container style={styles.container}>
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
              {/* Mailchimp merge tag */}
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
    WebkitFontSmoothing: 'antialiased',
  },
  bodyText: {
    color: '#081146',
    fontSize: '16px',
    fontWeight: 400,
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
  hr: {
    borderTop: '1px solid rgb(197, 200, 220)',
    margin: '40px 0',
  },
  issueTag: {
    backgroundColor: '#6560e2',
    borderRadius: '32px',
    boxShadow: '0px 4px 10px rgba(23, 43, 58, 0.25)',
    boxSizing: 'border-box' as const,
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 500,
    height: '32px',
    lineHeight: '32px',
    margin: 0,
    padding: '0 17px',
    textTransform: 'uppercase' as const,
  },
  link: {
    color: '#D60690',
    textDecoration: 'underline',
  },
  linkText: {
    color: '#081146',
    fontSize: '16px',
    fontWeight: 400,
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
    fontWeight: 600,
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
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 500,
    margin: 0,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
} as const

export default Newsletter

Newsletter.PreviewProps = issue399 satisfies NewsletterProps
