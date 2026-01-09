import type { SVGProps } from 'react'

export const TitleArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={12} width={12} {...props}>
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M1 11L11 1" />
      <path d="M3 1H11V9" />
    </g>
  </svg>
)
