import type { ComponentProps } from "react";

export function Center(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex items-center justify-center ${props.className ?? ""}`}
    />
  );
}
