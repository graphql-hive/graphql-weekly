import type { CSSProperties } from "react";

type SpinnerColor = "grey" | "white";

interface SpinnerProps {
  color?: SpinnerColor;
  size?: number;
}

const spinnerColors: Record<SpinnerColor, { bg: string; fg: string }> = {
  grey: {
    bg: "rgba(120,120,120,0.2)",
    fg: "rgba(120,120,120,1)",
  },
  white: {
    bg: "rgba(255,255,255,0.2)",
    fg: "rgba(255,255,255,1)",
  },
};

export function Spinner({ color = "grey", size = 40 }: SpinnerProps) {
  const borderWidth = size / 12;
  const colors = spinnerColors[color];

  const style: CSSProperties = {
    animation: "loader 0.7s infinite ease-out",
    borderBottom: `${borderWidth}px solid ${colors.bg}`,
    borderLeft: `${borderWidth}px solid ${colors.fg}`,
    borderRadius: "50%",
    borderRight: `${borderWidth}px solid ${colors.bg}`,
    borderTop: `${borderWidth}px solid ${colors.bg}`,
    fontSize: 10,
    height: size,
    position: "relative",
    textIndent: "-9999em",
    transform: "translateZ(0)",
    width: size,
  };

  return <div className="loader" style={style} />;
}
