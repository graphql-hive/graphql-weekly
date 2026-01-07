interface XProps {
  size?: number
  color?: string
}

export default function X({ size = 8, color = '#FFF' }: XProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="x"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path id="Vector" d="M6 0L0 6" transform="translate(1 1)" />
        <path id="Vector_2" d="M0 0L6 6" transform="translate(1 1)" />
      </g>
    </svg>
  )
}
