import type React from "react";
import type { ComponentProps, DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "../cn";

const variantClasses = {
  danger:
    "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600",
  primary: "bg-primary text-neu-900 border-primary hover:bg-primary/80",
  secondary:
    "bg-transparent text-neu-600 dark:text-neu-300 border-neu-300 dark:border-neu-600 hover:bg-neu-100 dark:hover:bg-neu-800",
} satisfies Record<string, string>;

export type ButtonVariant = keyof typeof variantClasses;

const baseClasses =
  "py-3 px-4 border box-border outline-none uppercase leading-none text-sm disabled:opacity-30 disabled:cursor-not-allowed";

export declare namespace ButtonProps {
  interface BaseProps {
    block?: boolean;
    className?: string;
    disabled?: boolean;
    variant?: ButtonVariant;
  }

  interface LinkProps extends BaseProps, Omit<ComponentProps<"a">, "href"> {
    as?: never;
    href: string;
  }

  interface ButtonElementProps
    extends BaseProps, Omit<ComponentProps<"button">, "color"> {
    as?: undefined;
    href?: never;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "reset" | "submit";
  }

  interface NonInteractiveProps
    extends
      BaseProps,
      DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    as: "div" | "label" | "span";
    href?: never;
  }
}

export type ButtonProps =
  | ButtonProps.ButtonElementProps
  | ButtonProps.LinkProps
  | ButtonProps.NonInteractiveProps;

export function Button(props: ButtonProps) {
  const className = cn(
    baseClasses,
    variantClasses[props.variant ?? "primary"],
    props.block ? "block w-full" : "inline-block",
    props.disabled && "opacity-30 pointer-events-none",
    props.className,
  );

  if ("href" in props && typeof props.href === "string") {
    const {
      as: ___,
      block: __,
      className: ____,
      disabled,
      href,
      variant: _,
      ...rest
    } = props;
    return (
      <a
        href={href}
        {...rest}
        aria-disabled={disabled || undefined}
        className={className}
      />
    );
  }

  if (props.as) {
    const { as, block: __, className: ___, variant: _, ...rest } = props;
    const Root = as as "span";
    return <Root {...rest} className={className} />;
  }

  const { block: __, className: ___, variant: _, ...rest } = props;
  return <button {...rest} className={className} />;
}

export const ButtonLink = Button as (
  props: ButtonProps.LinkProps,
) => React.JSX.Element;
