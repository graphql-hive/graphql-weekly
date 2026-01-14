import type React from "react";

import { cn } from "../../lib/cn";
import { Arrow } from "../vectors/Arrow";

export interface ArrowLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  text: string;
}

export function ArrowLink({
  className,
  href,
  target,
  text,
  ...rest
}: ArrowLinkProps) {
  const isExternal = target === "_blank" || href.startsWith("http");

  return (
    <a
      className={cn(
        "focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2",
        className,
      )}
      href={href}
      target={target}
      {...rest}
    >
      <span className="mr-3 font-rubik font-medium leading-[18px] text-lg text-right">
        {text}
      </span>
      <Arrow aria-hidden="true" />
      {isExternal && <span className="sr-only">(opens in new tab)</span>}
    </a>
  );
}
