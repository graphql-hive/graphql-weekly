import type { ComponentProps, CSSProperties } from "react";

interface FlexCellProps extends ComponentProps<"section"> {
  align?: string;
  basis?: string;
  grow?: number | string;
  margin?: string;
}

export default function FlexCell({
  align = "flex-start",
  basis = "0px",
  className,
  grow = 1,
  margin,
  style,
  ...props
}: FlexCellProps) {
  const combinedStyle: CSSProperties = {
    alignSelf: align,
    flex: `${grow} 0 ${basis}`,
    margin: margin ?? 0,
    ...style,
  };

  return <section {...props} className={className} style={combinedStyle} />;
}
