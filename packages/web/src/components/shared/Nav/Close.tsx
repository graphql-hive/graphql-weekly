import type { SVGProps } from "react";

export const Close = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={20} width={20} {...props}>
    <rect
      fill="#fff"
      height={4}
      rx={2}
      transform="rotate(-45 .1 17.071)"
      width={24}
      x={0.101}
      y={17.071}
    />
    <rect
      fill="#fff"
      height={4}
      rx={2}
      transform="scale(-1 1) rotate(-45 10.657 32.557)"
      width={24}
    />
  </svg>
);
