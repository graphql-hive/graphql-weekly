import type { SVGProps } from 'react'

export const Archive = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height={16}
    style={{ display: 'inline-block' }}
    viewBox="0 0 18 16"
    width={18}
    {...props}
  >
    <path
      d="M15 5v10H3V5M17 1H1v4h16V1zM8 8h2"
      stroke="#9DA0B5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)
