import type React from "react";

import { cn } from "../../../lib/cn";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SecondaryButton({ className, ...rest }: SecondaryButtonProps) {
  return (
    <button
      className={cn(
        "border-none font-medium leading-none text-lg text-right bg-none text-light-dark cursor-pointer transition-[transform,box-shadow] duration-140 ease-out hover:underline hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2",
        className,
      )}
      {...rest}
    />
  );
}
