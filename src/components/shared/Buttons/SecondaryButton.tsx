import type React from 'react'

import { cn } from '../../../lib/cn'

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SecondaryButton({ className, ...rest }: SecondaryButtonProps) {
  return (
    <button
      className={cn(
        'border-none outline-none',
        'font-medium leading-none text-lg text-right bg-none',
        'text-[#9da0b5] cursor-pointer',
        'transition-[transform,box-shadow] duration-[140ms] ease-out',
        'hover:underline hover:translate-y-[-1px]',
        className,
      )}
      {...rest}
    />
  )
}
