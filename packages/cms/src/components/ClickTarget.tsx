import type { ComponentProps } from "react";

export default function ClickTarget({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`border-none bg-transparent p-0 cursor-pointer m-0 text-sm outline-none ${className ?? ""}`}
    />
  );
}
