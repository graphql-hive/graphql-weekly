import type { ComponentProps } from "react";

export function HeaderContainer({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section {...props} className={`py-4 flex ${className ?? ""}`} />
  );
}

export function Header({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className={`text-[19px] flex-1 self-center leading-6 text-[#0C344B] m-0 ${className ?? ""}`}
    />
  );
}
