import type React from 'react'
import { cn } from '../../../lib/cn'

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: string
  placeholder: string
}

export function Input({ label, placeholder, className, ...rest }: InputProps) {
  return (
    <div className="h-10 inline-flex items-stretch flex-shrink flex-grow w-auto">
      <label className="w-[69px] flex-shrink-0 font-medium leading-none text-base md:text-lg uppercase self-center text-[#0a1659]">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          'flex-grow flex-shrink flex-auto h-10 w-full p-0',
          'font-rubik font-normal leading-none text-base md:text-lg',
          'border-none outline-none text-[#081146]',
          'placeholder:text-[#9da0b5]',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
