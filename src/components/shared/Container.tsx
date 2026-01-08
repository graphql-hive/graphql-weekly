import type React from 'react'

import { cn } from '../../lib/cn'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        'max-w-[600px] px-2 box-content md:max-w-[1200px] md:px-0 mx-auto',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
