import type { SVGProps } from 'react'

export const Check = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={12} width={16} {...props}>
    <path
      d="M15 1L5.375 11 1 6.455"
      opacity={0.66}
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)
