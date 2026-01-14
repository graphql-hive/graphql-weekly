import type { ComponentProps } from "react";

export default function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`
        px-4 py-[13px] text-sm border border-neu-300 block
        transition-all duration-100 outline-none
        placeholder:text-neu-400
        focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)]
        disabled:italic disabled:bg-neu-200
        dark:bg-neu-800 dark:border-neu-700 dark:text-neu-100
        dark:placeholder:text-neu-500
        ${className ?? ""}
      `}
    />
  );
}
