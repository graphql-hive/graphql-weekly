import type { SVGProps } from 'react'

export const Arrow = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height={8} viewBox="0 0 12 8" width={12} {...props}>
    <path
      d="M10.991 0c.838 0 1.31.915.795 1.542l-4.991 6.09a1.041 1.041 0 0 1-1.59 0L.214 1.541C-.301.915.171 0 1.009 0h9.982z"
      fill="#fff"
      opacity={0.66}
    />
  </svg>
)
