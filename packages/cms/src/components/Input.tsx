import { type ComponentProps, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`
          px-4 py-3 text-sm border border-neu-300 block outline-none
          disabled:italic disabled:bg-neu-200
          placeholder:text-neu-400
          focus:not-[:is([type=checkbox])]:border-primary
          focus:not-[:is([type=checkbox])]:shadow-[inset_0_0_0_1px_var(--color-primary)]
          dark:bg-neu-800 dark:border-neu-700 dark:text-neu-100
          dark:placeholder:text-neu-500
          ${className ?? ""}
        `}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
