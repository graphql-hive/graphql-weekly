import type React from 'react'

import { cn } from '../../../lib/cn'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  placeholder: string
}

export function Input({ className, label, placeholder, ...rest }: InputProps) {
  return (
    <div className="h-10 inline-flex items-stretch shrink grow w-full">
      <label className="w-[69px] shrink-0 font-medium leading-none text-base md:text-lg uppercase self-center text-dark">
        {label}
      </label>
      <input
        className={cn(
          'grow shrink flex-auto h-10 w-full p-0 font-rubik font-normal leading-none text-base md:text-lg border-none outline-hidden text-footer-dark placeholder:text-light-dark',
          className,
        )}
        placeholder={placeholder}
        type="text"
        {...rest}
      />
    </div>
  )
}
