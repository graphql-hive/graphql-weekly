import type { ComponentProps } from "react";

export default function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={`block mb-2 text-left text-xs leading-[15px] text-[#0c344b] ${className ?? ""}`}
    />
  );
}
