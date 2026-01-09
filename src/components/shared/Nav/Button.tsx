import type { SVGProps } from 'react'

export const Button = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={20} width={24} {...props}>
    <rect fill="#fff" height={4} rx={2} width={24} />
    <rect fill="#fff" height={4} rx={2} width={24} y={8} />
    <rect fill="#fff" height={4} rx={2} width={24} y={16} />
  </svg>
)
