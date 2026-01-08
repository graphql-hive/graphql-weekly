import type { ComponentProps, CSSProperties } from "react";

interface FlexCellProps extends ComponentProps<"section"> {
  grow?: string | number;
  basis?: string;
  margin?: string;
  align?: string;
}

export default function FlexCell({
  grow = 1,
  basis = "0px",
  margin,
  align = "flex-start",
  style,
  className,
  ...props
}: FlexCellProps) {
  const combinedStyle: CSSProperties = {
    flex: `${grow} 0 ${basis}`,
    margin: margin ?? 0,
    alignSelf: align,
    ...style,
  };

  return <section {...props} style={combinedStyle} className={className} />;
}
