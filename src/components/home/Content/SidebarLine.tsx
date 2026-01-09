import type React from 'react'
import { cn } from '../../../lib/cn'

export interface SidebarLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarLine({ className, ...rest }: SidebarLineProps) {
  return (
    <div
      className={cn(
        'w-auto h-px bg-[#9da0b5] opacity-50 my-10 ml-[23px] mr-0',
        className,
      )}
      {...rest}
    />
  )
}
