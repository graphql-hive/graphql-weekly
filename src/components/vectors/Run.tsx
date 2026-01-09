import type { SVGProps } from 'react'

export const Run = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={14} width={11} {...props}>
    <path
      d="M2.555 1.905l6.394 4.263a1 1 0 0 1 0 1.664l-6.394 4.263A1 1 0 0 1 1 11.263V2.737a1 1 0 0 1 1.555-.832z"
      opacity={0.66}
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)
