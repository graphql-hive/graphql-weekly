import type { SVGProps } from 'react'

export const Subscribe = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={18} width={18} {...props}>
    <g
      opacity={0.66}
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M17 1L8.2 9.8M17 1l-5.6 16-3.2-7.2L1 6.6 17 1z" />
    </g>
  </svg>
)
