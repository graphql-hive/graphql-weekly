import type React from "react";

import { cn } from "../../../lib/cn";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  placeholder: string;
}

export function Input({ className, label, placeholder, ...rest }: InputProps) {
  return (
    <label className="h-10 inline-flex items-stretch shrink grow w-full">
      <span className="w-[69px] shrink-0 font-medium leading-none text-base md:text-lg uppercase self-center text-dark">
        {label}
      </span>
      <input
        className={cn(
          "grow shrink flex-auto h-10 w-full p-0 font-rubik font-normal leading-none text-base md:text-lg border-none text-footer-dark placeholder:text-light-dark focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2",
          className,
        )}
        placeholder={placeholder}
        type="text"
        {...rest}
      />
    </label>
  );
}
