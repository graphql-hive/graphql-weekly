import type { ComponentProps, CSSProperties } from "react";

interface FlexProps extends ComponentProps<"section"> {
  align?: string;
  direction?: "column" | "row";
  margin?: string;
}

export default function Flex({
  align = "flex-start",
  className,
  direction = "row",
  margin,
  style,
  ...props
}: FlexProps) {
  const combinedStyle: CSSProperties = {
    display: "flex",
    flexDirection: direction,
    justifyContent: align,
    margin: margin ?? 0,
    ...style,
  };

  return <section {...props} className={className} style={combinedStyle} />;
}
