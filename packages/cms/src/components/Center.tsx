import type { ComponentProps } from "react";

export default function Center(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex items-center justify-center ${props.className ?? ""}`}
    />
  );
}
