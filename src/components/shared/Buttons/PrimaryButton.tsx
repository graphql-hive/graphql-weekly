import type React from "react";

import { cn } from "../../../lib/cn";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  text: React.ReactNode;
}

export function PrimaryButton({
  className,
  icon,
  text,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center h-10 px-4 bg-purple shadow-[0px_4px_10px_rgba(23,43,58,0.25)] rounded-sm cursor-pointer border-none outline-hidden transition-[transform,box-shadow,background] duration-140 ease-out hover:-translate-y-px hover:shadow-[0px_7px_16px_rgba(23,43,58,0.22)] disabled:shadow-none disabled:bg-disabled",
        className,
      )}
      {...rest}
    >
      {icon && <div className="mr-[11px] [&_svg]:block">{icon}</div>}
      <span className="font-medium leading-none text-base uppercase text-white">
        {text}
      </span>
    </button>
  );
}
