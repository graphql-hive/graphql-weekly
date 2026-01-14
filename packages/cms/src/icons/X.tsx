interface XProps {
  color?: string;
  size?: number;
}

export function X({ color = "#FFF", size = 8 }: XProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 8 8"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="x"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M6 0L0 6" id="Vector" transform="translate(1 1)" />
        <path d="M0 0L6 6" id="Vector_2" transform="translate(1 1)" />
      </g>
    </svg>
  );
}
