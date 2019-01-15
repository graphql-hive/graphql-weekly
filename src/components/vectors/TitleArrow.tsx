import * as React from 'react'

export const TitleArrow = (props: any) => (
  <svg width={12} height={12} fill="none" {...props}>
    <g
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 11L11 1"/>
      <path d="M3 1H11V9"/>
    </g>
  </svg>
)