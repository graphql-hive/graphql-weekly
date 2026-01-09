import type { SVGProps } from 'react'

export const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={14} width={14} {...props}>
    <path
      d="M13 7H1M7 13L1 7l6-6"
      stroke="#9DA0B5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)
