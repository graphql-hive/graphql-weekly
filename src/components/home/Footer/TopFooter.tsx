import * as React from 'react'

import { ArrowLink } from '../../shared/ArrowLink'

export const TopFooter = () => {
  return (
    <div className="flex w-full justify-between">
      <div className="max-w-[376px] font-normal leading-6 text-lg text-[rgba(255,255,255,0.33)]">
        Feeling nerdy? Query issues of GraphQL Weekly, with GraphQL itself!
      </div>
      <div className="font-normal leading-6 text-lg text-[rgba(255,255,255,0.33)] [&_*]:text-[rgba(255,255,255,0.33)] [&_*]:font-normal [&_a]:underline [&_svg]:opacity-30">
        Powered by the{' '}
        <ArrowLink
          href="https://graphql-weekly.graphcdn.app/"
          text="GraphQL Playground"
        />
      </div>
    </div>
  )
}
