import type React from 'react'

import { cn } from '../../lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-large bg-white shadow-[0px_0px_2px_rgba(8,35,51,0.03),0px_3px_6px_rgba(8,35,51,0.05)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
