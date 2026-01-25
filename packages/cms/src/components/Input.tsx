import { type ComponentProps, forwardRef, type ReactNode } from "react";

import { cn } from "../cn";
import { RedCross } from "../icons/RedCross";

const sizeClasses = {
  md: "h-10 py-3 px-4 text-sm",
  sm: "h-7 py-1.5 px-3 text-xs",
  xs: "h-5 py-0.5 px-1.5 text-[10px]",
} satisfies Record<string, string>;

type InputSize = keyof typeof sizeClasses;

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  error?: ReactNode;
  label?: string;
  size?: InputSize;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, size = "md", ...props }, ref) => {
    const inputElement = (
      <input
        ref={ref}
        {...props}
        className={cn(
          "flex-1 min-w-0 bg-transparent border-none outline-none text-right dark:text-neu-100 placeholder:text-neu-400 dark:placeholder:text-neu-600",
          !label && sizeClasses[size],
          !label &&
            "border border-neu-300 block disabled:italic disabled:bg-neu-200 focus:not-[:is([type=checkbox])]:border-primary focus:not-[:is([type=checkbox])]:shadow-[inset_0_0_0_1px_var(--color-primary)] dark:bg-neu-800 dark:border-neu-700",
          !label && "text-left",
          className,
        )}
      />
    );

    const wrapper = label ? (
      <label
        className={cn(
          "flex items-center flex-1 min-w-0 border border-neu-300",
          "focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]",
          "dark:bg-neu-800 dark:border-neu-700",
          props.disabled && "italic bg-neu-200",
          sizeClasses[size],
        )}
      >
        <span className="text-neu-400 dark:text-neu-500 shrink-0">{label}</span>
        {inputElement}
      </label>
    ) : (
      inputElement
    );

    if (error) {
      return (
        <div className="flex flex-1 min-w-0 flex-col">
          {wrapper}
          <div className="flex items-center gap-2.5 mt-2.5">
            <RedCross />
            <span className="text-xs leading-[15px] text-[#FF4F56]">
              {error}
            </span>
          </div>
        </div>
      );
    }

    return wrapper;
  },
);

Input.displayName = "Input";

export { Input };
export type { InputSize };
