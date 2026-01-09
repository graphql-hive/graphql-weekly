import type React from 'react'
import { cn } from '../../../lib/cn'

export interface VLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function VLine({ className, ...rest }: VLineProps) {
  return (
    <div className={cn('w-px h-10 mx-6 bg-[#dadbe3]', className)} {...rest} />
  )
}
