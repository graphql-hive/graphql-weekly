import type { ComponentProps } from "react";
import { Link } from "wouter";

type ButtonVariant = "primary" | "secondary" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-neu-900 border-primary hover:bg-[#a8d448] hover:border-[#a8d448]",
  secondary:
    "bg-transparent text-neu-600 dark:text-neu-300 border-neu-300 dark:border-neu-600 hover:bg-neu-100 dark:hover:bg-neu-800",
  danger:
    "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600",
};

const baseClasses =
  "py-3 px-4 border box-border outline-none uppercase leading-none text-sm  disabled:opacity-30 disabled:cursor-not-allowed";

interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  variant?: ButtonVariant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${block ? "block w-full" : "inline-block"} ${className ?? ""}`}
    />
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<"a">, "color" | "href"> {
  to: string;
  variant?: ButtonVariant;
  block?: boolean;
  disabled?: boolean;
}

export function ButtonLink({
  to,
  variant = "primary",
  block,
  disabled,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={to}
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${block ? "block w-full" : "inline-block"} ${disabled ? "opacity-30 pointer-events-none" : ""} ${className ?? ""}`}
    />
  );
}
