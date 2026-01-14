import type { ComponentProps } from "react";

export default function Label({
  className,
  ...props
}: ComponentProps<"label">) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- generic wrapper, consumers provide htmlFor
    <label
      {...props}
      className={`block mb-2 text-left text-xs leading-[15px] text-neu-700 dark:text-neu-300 ${className ?? ""}`}
    />
  );
}
