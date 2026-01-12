import type { SVGProps } from "react";

export const ArrowRight = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={14} width={14} {...props}>
    <path
      d="M1 7h12M7 1l6 6-6 6"
      stroke="#9DA0B5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);
