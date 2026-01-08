import type { ComponentProps } from "react";

export default function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`
        px-4 py-[13px] rounded-md text-sm border border-[#CCD9DF] block
        transition-all duration-100 outline-none
        disabled:italic disabled:bg-[#CCD9DF]
        placeholder:text-[rgba(61,85,107,0.6)]
        focus:not-[:is([type=checkbox])]:border-transparent
        focus:not-[:is([type=checkbox])]:shadow-[inset_0_0_0_2px_#0F7AD8]
        ${className ?? ""}
      `}
    />
  );
}
