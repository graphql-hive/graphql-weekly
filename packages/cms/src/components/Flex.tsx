import type { ComponentProps, CSSProperties } from "react";

interface FlexProps extends ComponentProps<"section"> {
  direction?: "row" | "column";
  margin?: string;
  align?: string;
}

export default function Flex({
  direction = "row",
  margin,
  align = "flex-start",
  style,
  className,
  ...props
}: FlexProps) {
  const combinedStyle: CSSProperties = {
    display: "flex",
    flexDirection: direction,
    margin: margin ?? 0,
    justifyContent: align,
    ...style,
  };

  return <section {...props} style={combinedStyle} className={className} />;
}
