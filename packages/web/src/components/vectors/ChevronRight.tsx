import type { SVGProps } from "react";

export const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={14} width={14} {...props}>
    <path
      d="M5 2l5 5-5 5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);
