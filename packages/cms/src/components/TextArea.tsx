import type { ComponentProps } from "react";

export default function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`
        px-4 py-[13px] rounded text-sm border border-[#d9e3ed] block
        transition-all duration-100 outline-none
        placeholder:text-[rgba(61,85,107,0.4)]
        focus:border-[#1f8ceb] focus:shadow-[0_0_2px_#1f8ceb]
        disabled:italic
        ${className ?? ""}
      `}
    />
  );
}
