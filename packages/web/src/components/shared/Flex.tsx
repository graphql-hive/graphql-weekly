import type React from "react";

import { cn } from "../../lib/cn";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  alignItems?: string;
  children?: React.ReactNode;
}

export function RowFlex({
  alignItems,
  children,
  className,
  style,
  ...rest
}: FlexProps) {
  return (
    <div
      className={cn("flex flex-row", className)}
      style={{ alignItems: alignItems || "auto", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ColumnFlex({
  alignItems,
  children,
  className,
  style,
  ...rest
}: FlexProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ alignItems: alignItems || "auto", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
