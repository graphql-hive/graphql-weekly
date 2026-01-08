import * as React from 'react'

export const ContentWrapper = ({ children, ...props }: any) => (
  <div
    className="flex-grow flex-shrink max-w-3xl -mt-16 pt-2 w-full"
    {...props}
  >
    {children}
  </div>
)
