import type React from 'react'
import { cn } from '../../../lib/cn'

export interface FooterLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FooterLine({ className, ...rest }: FooterLineProps) {
  return (
    <div className={cn('w-auto h-px my-8 bg-white/10', className)} {...rest} />
  )
}
