import type React from "react";
import type { ComponentProps, DetailedHTMLProps, HTMLAttributes } from "react";
import { Link } from "wouter";
import { cn } from "../cn";

const variantClasses = {
  primary: "bg-primary text-neu-900 border-primary hover:bg-primary/80",
  secondary:
    "bg-transparent text-neu-600 dark:text-neu-300 border-neu-300 dark:border-neu-600 hover:bg-neu-100 dark:hover:bg-neu-800",
  danger:
    "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600",
} satisfies Record<string, string>;

export type ButtonVariant = keyof typeof variantClasses;

const baseClasses =
  "py-3 px-4 border box-border outline-none uppercase leading-none text-sm disabled:opacity-30 disabled:cursor-not-allowed";

export declare namespace ButtonProps {
  interface BaseProps {
    variant?: ButtonVariant;
    block?: boolean;
    className?: string;
    disabled?: boolean;
  }

  interface LinkProps
    extends BaseProps,
      Omit<ComponentProps<typeof Link>, "href" | "to"> {
    href: string;
    as?: never;
  }

  interface ButtonElementProps
    extends BaseProps,
      Omit<ComponentProps<"button">, "color"> {
    href?: never;
    as?: never;
    type?: "button" | "submit" | "reset";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }

  interface NonInteractiveProps
    extends BaseProps,
      DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    href?: never;
    as: "span" | "div" | "label";
  }
}

export type ButtonProps =
  | ButtonProps.LinkProps
  | ButtonProps.ButtonElementProps
  | ButtonProps.NonInteractiveProps;

export function Button(props: ButtonProps) {
  const className = cn(
    baseClasses,
    variantClasses[props.variant ?? "primary"],
    props.block ? "block w-full" : "inline-block",
    props.disabled && "opacity-30 pointer-events-none",
    props.className
  );

  if ("href" in props && typeof props.href === "string") {
    const {
      variant: _,
      block: __,
      disabled,
      href,
      as: ___,
      className: ____,
      asChild: _____,
      ...rest
    } = props;
    return (
      <Link
        href={href}
        {...rest}
        className={className}
        aria-disabled={disabled || undefined}
      />
    );
  }

  if (props.as) {
    const { variant: _, block: __, as, className: ___, ...rest } = props;
    const Root = as as "span";
    return <Root {...rest} className={className} />;
  }

  const { variant: _, block: __, className: ___, ...rest } = props;
  return <button {...rest} className={className} />;
}

export const ButtonLink = Button as (
  props: ButtonProps.LinkProps
) => React.JSX.Element;
