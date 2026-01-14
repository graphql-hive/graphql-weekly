import type React from "react";

import { cn } from "../../lib/cn";

export interface UnstyledUlProps extends React.HTMLAttributes<HTMLUListElement> {}

export function UnstyledUl({ className, ...rest }: UnstyledUlProps) {
  return <ul className={cn("p-0 m-0", className)} {...rest} />;
}

export interface UnstyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function UnstyledButton({ className, ...rest }: UnstyledButtonProps) {
  return (
    <button
      className={cn(
        "p-0 bg-none border-none cursor-pointer text-inherit focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2",
        className,
      )}
      {...rest}
    />
  );
}
