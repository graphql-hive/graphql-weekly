import type React from 'react'

import { cn } from '../../lib/cn'

export interface UpperCaseTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function UpperCaseTitle({ className, ...rest }: UpperCaseTitleProps) {
  return (
    <div
      className={cn(
        'text-sm font-semibold uppercase tracking-[-0.01em] mb-4',
        className,
      )}
      {...rest}
    />
  )
}
