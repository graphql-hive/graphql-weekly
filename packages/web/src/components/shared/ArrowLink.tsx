import type React from "react";

import { Arrow } from "../vectors/Arrow";

export interface ArrowLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  text: string;
}

export function ArrowLink({ href, text, ...rest }: ArrowLinkProps) {
  return (
    <a href={href} {...rest}>
      <span className="mr-3 font-rubik font-medium leading-[18px] text-lg text-right">
        {text}
      </span>
      <Arrow />
    </a>
  );
}
