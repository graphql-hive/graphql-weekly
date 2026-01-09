import type React from 'react'

import { cn } from '../../../lib/cn'

export interface HLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HLine({ className, ...rest }: HLineProps) {
  return (
    <div
      className={cn('w-auto h-px my-6 md:my-10 bg-gray-border', className)}
      {...rest}
    />
  )
}
