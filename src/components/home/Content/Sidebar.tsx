import * as React from 'react'

// Local
import { Space } from '../../shared/Space'
import { SideMenu } from './SideMenu'
import { Submit } from './Submit'
import { SidebarLine } from './SidebarLine'
import Twitter from '../../vectors/Twitter'
import Slack from '../../vectors/Slack'
import Archive from '../../vectors/Archive'
import type { IssueType } from '../../../types'
import { getTopicUrlFriendly } from '../../../lib/api'
import { SideBanner } from './SideBanner'

type Props = {
  submitModalClickHandler: Function
  currentIssueNumber?: number
  topicsTitles: string[]
  allIssues: IssueType[]
}

type State = {
  showAllIssues: boolean
}

export class Sidebar extends React.Component<Props, State> {
  state = {
    showAllIssues: false,
  }

  render() {
    const props = this.props

    return (
      <div className="flex-grow ml-[42px] max-lg:hidden">
        <Submit submitModalClickHandler={props.submitModalClickHandler} />

        <SidebarLine />

        <SideBanner />

        <SidebarLine />

        <SideMenu
          heading="Join the community"
          items={[
            {
              text: 'Follow on Twitter',
              href: 'https://twitter.com/graphqlweekly',
              icon: <Twitter />,
            },
            {
              text: 'Join us on Slack',
              href: 'https://discord.graphql.org/',
              icon: <Slack />,
            },
          ]}
        />

        <SidebarLine />

        <SideMenu
          heading="topics"
          primaryColor="#009BE3"
          items={props.topicsTitles.map((title) => {
            const url = `/topic/${getTopicUrlFriendly(title)}`

            return {
              to: `${url}#content`,
              text: title,
              selected: isCurrentUrl(url),
            }
          })}
        />

        <SidebarLine />
        <SideMenu
          heading="Recent issues"
          primaryColor="#D60690"
          isExpanded={this.state.showAllIssues}
          items={[
            ...props.allIssues
              .slice(0, this.state.showAllIssues ? undefined : 11)
              .map((issue) => {
                const url = `/issues/${issue.number}`
                return {
                  to: `${url}#content`,
                  text: `Issue ${issue.number}`,
                  selected:
                    issue.number === props.currentIssueNumber ||
                    isCurrentUrl(url),
                }
              }),

            {
              text: this.state.showAllIssues
                ? 'Hide old issues'
                : 'View all issues',
              icon: <Archive />,
              extraTop: true,
              onClick: this.toggledShowAll,
            },
          ]}
        />
      </div>
    )
  }

  toggledShowAll = () => {
    this.setState((prev) => ({ showAllIssues: !prev.showAllIssues }))
  }
}

function isCurrentUrl(urlWithoutTrailingSlash: string) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  return (
    pathname.endsWith(urlWithoutTrailingSlash) ||
    pathname.includes(urlWithoutTrailingSlash + '/')
  )
}
