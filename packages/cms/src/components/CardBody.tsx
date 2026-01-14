import type { ComponentProps, CSSProperties } from "react";

interface CardBodyProps extends ComponentProps<"div"> {
  padding?: string;
}

export function CardBody({ padding, style, ...props }: CardBodyProps) {
  const combinedStyle: CSSProperties = {
    padding: padding ?? "24px",
    ...style,
  };

  return <div {...props} style={combinedStyle} />;
}
