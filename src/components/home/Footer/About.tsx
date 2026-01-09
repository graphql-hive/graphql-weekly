import * as React from 'react'

export const About = () => {
  return (
    <div className="flex w-full justify-center items-center">
      <div className="font-normal leading-6 text-lg text-[rgba(255,255,255,0.33)] [&_a]:underline [&_a]:text-[rgba(255,255,255,0.5)]">
        Curated by <a href="https://stellate.co/">Stellate</a>, and the awesome
        GraphQL community.
      </div>
    </div>
  )
}
