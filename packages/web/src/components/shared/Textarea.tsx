import { type TextareaHTMLAttributes, useId } from "react";

import { cn } from "../../lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder: string;
}

export function Textarea({
  className,
  id: providedId,
  label,
  placeholder,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <div className="w-full flex flex-col items-center shrink grow">
      <label
        className="w-full h-[18px] shrink-0 font-medium leading-none text-lg md:text-base uppercase text-dark mt-2.5"
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        className={cn(
          "w-full h-[100px] p-0 mt-4 font-rubik font-normal leading-none text-lg md:text-base border-none text-light-dark resize-y focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2",
          className,
        )}
        id={id}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
}
