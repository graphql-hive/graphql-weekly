import * as React from 'react'

export const Arrow = (props: any) => (
  <svg fill="none" height={10} width={10} {...props}>
    <g
      opacity={0.66}
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M1 9l8-8M1 1h8v8" />
    </g>
  </svg>
)
