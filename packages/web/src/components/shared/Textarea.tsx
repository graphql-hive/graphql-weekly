import type React from "react";

import { cn } from "../../lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder: string;
}

export function Textarea({
  className,
  label,
  placeholder,
  ...rest
}: TextareaProps) {
  return (
    <div className="w-full flex flex-col items-center shrink grow">
      <label className="w-full h-[18px] shrink-0 font-medium leading-none text-lg md:text-base uppercase text-dark mt-2.5">
        {label}
      </label>
      <textarea
        className={cn(
          "w-full h-[100px] p-0 mt-4 font-rubik font-normal leading-none text-lg md:text-base border-none outline-hidden text-light-dark resize-y",
          className,
        )}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
}
