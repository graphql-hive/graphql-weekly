import * as React from 'react'
import { Link } from '../../shared/Link'
import { cn } from '../../../lib/cn'
import { getTopicColor } from '../topicColors'

interface Props {
  heading: string
  primaryColor?: string
  isExpanded?: boolean
  items: Array<{
    to?: string
    href?: string
    selected?: boolean
    icon?: React.ReactNode
    text: string
    extraTop?: boolean
    onClick?: (e?: any) => void
  }>
}

export const SideMenu = ({ heading, isExpanded, items }: Props) => {
  return (
    <div className="ml-[23px] pb-6">
      <div className="mb-2 font-medium leading-none text-lg uppercase text-[#9da0b5]">
        {heading}
      </div>
      <div className={cn(isExpanded && 'overflow-y-scroll max-h-[600px]')}>
        {items &&
          items.map((e) => {
            const topicColor = getTopicColor(e.text)
            return (
              <Link
                to={e.to}
                href={e.href}
                key={e.text + e.to}
                onClick={e.onClick}
                className={cn(
                  'flex items-center w-full no-underline font-medium leading-[18px] text-lg align-middle text-[#081146]',
                  '-ml-2 pl-2 -mr-2 pr-2 py-1 rounded hover:bg-[#8683d40c] transition-colors',
                  e.extraTop ? 'mt-5' : 'mt-3',
                )}
                style={e.selected ? { color: topicColor } : undefined}
              >
                {e.selected && (
                  <div
                    className="w-2 h-2 rounded-full -ml-[23px] mr-[15px]"
                    style={{ background: topicColor }}
                  />
                )}
                {e.icon && (
                  <div className="mr-[15px] mt-px -mb-px">{e.icon}</div>
                )}
                {e.text}
              </Link>
            )
          })}
      </div>
    </div>
  )
}
