import * as React from 'react'

import type { IssueType } from '../../../types'

import { getTopicUrlFriendly } from '../../../lib/api'
// Local
import Archive from '../../vectors/Archive'
import Slack from '../../vectors/Slack'
import Twitter from '../../vectors/Twitter'
import { SideBanner } from './SideBanner'
import { SidebarLine } from './SidebarLine'
import { SideMenu } from './SideMenu'
import { Submit } from './Submit'

type Props = {
  allIssues: IssueType[]
  currentIssueNumber?: number
  submitModalClickHandler: Function
  topicsTitles: string[]
}

type State = {
  showAllIssues: boolean
}

export class Sidebar extends React.Component<Props, State> {
  state = {
    showAllIssues: false,
  }

  render() {
    const {props} = this

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
              href: 'https://twitter.com/graphqlweekly',
              icon: <Twitter />,
              text: 'Follow on Twitter',
            },
            {
              href: 'https://discord.graphql.org/',
              icon: <Slack />,
              text: 'Join us on Slack',
            },
          ]}
        />

        <SidebarLine />

        <SideMenu
          heading="topics"
          items={props.topicsTitles.map((title) => {
            const url = `/topic/${getTopicUrlFriendly(title)}`

            return {
              selected: isCurrentUrl(url),
              text: title,
              to: `${url}#content`,
            }
          })}
          primaryColor="#009BE3"
        />

        <SidebarLine />
        <SideMenu
          heading="Recent issues"
          isExpanded={this.state.showAllIssues}
          items={[
            ...props.allIssues
              .slice(0, this.state.showAllIssues ? undefined : 11)
              .map((issue) => {
                const url = `/issues/${issue.number}`
                return {
                  selected:
                    issue.number === props.currentIssueNumber ||
                    isCurrentUrl(url),
                  text: `Issue ${issue.number}`,
                  to: `${url}#content`,
                }
              }),

            {
              extraTop: true,
              icon: <Archive />,
              onClick: this.toggledShowAll,
              text: this.state.showAllIssues
                ? 'Hide old issues'
                : 'View all issues',
            },
          ]}
          primaryColor="#D60690"
        />
      </div>
    )
  }

  toggledShowAll = () => {
    this.setState((prev) => ({ showAllIssues: !prev.showAllIssues }))
  }
}

function isCurrentUrl(urlWithoutTrailingSlash: string) {
  const pathname =
    globalThis.window === undefined ? '' : globalThis.location.pathname
  return (
    pathname.endsWith(urlWithoutTrailingSlash) ||
    pathname.includes(urlWithoutTrailingSlash + '/')
  )
}
