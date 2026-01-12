import type { CSSProperties } from "react";

type SpinnerColor = "white" | "grey";

interface SpinnerProps {
  color?: SpinnerColor;
  size?: number;
}

const spinnerColors: Record<SpinnerColor, { bg: string; fg: string }> = {
  white: {
    bg: "rgba(255,255,255,0.2)",
    fg: "rgba(255,255,255,1)",
  },
  grey: {
    bg: "rgba(120,120,120,0.2)",
    fg: "rgba(120,120,120,1)",
  },
};

export default function Spinner({ color = "grey", size = 40 }: SpinnerProps) {
  const borderWidth = size / 12;
  const colors = spinnerColors[color];

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    fontSize: 10,
    position: "relative",
    textIndent: "-9999em",
    borderTop: `${borderWidth}px solid ${colors.bg}`,
    borderRight: `${borderWidth}px solid ${colors.bg}`,
    borderBottom: `${borderWidth}px solid ${colors.bg}`,
    borderLeft: `${borderWidth}px solid ${colors.fg}`,
    transform: "translateZ(0)",
    animation: "loader 0.7s infinite ease-out",
  };

  return <div className="loader" style={style} />;
}
