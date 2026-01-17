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

const sizeClasses = {
  md: "py-3 px-4 text-sm",
  sm: "py-1.5 px-3 text-xs",
} satisfies Record<string, string>;

export type ButtonSize = keyof typeof sizeClasses;

const baseClasses =
  "border box-border outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 uppercase leading-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center";

interface ButtonBaseProps {
  block?: boolean;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

interface ButtonLinkProps
  extends ButtonBaseProps, Omit<ComponentProps<"a">, "href"> {
  as?: never;
  href: string;
}

interface ButtonElementProps
  extends ButtonBaseProps, Omit<ComponentProps<"button">, "color"> {
  as?: undefined;
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "reset" | "submit";
}

interface ButtonNonInteractiveProps
  extends
    ButtonBaseProps,
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  as: "div" | "label" | "span";
  href?: never;
}

export type ButtonProps =
  | ButtonElementProps
  | ButtonLinkProps
  | ButtonNonInteractiveProps;

export function Button(props: ButtonProps) {
  const className = cn(
    baseClasses,
    sizeClasses[props.size ?? "md"],
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
      size: _____,
      variant: _,
      ...rest
    } = props;
    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content -- children included in rest spread
      <a
        href={href}
        {...rest}
        aria-disabled={disabled || undefined}
        className={className}
      />
    );
  }

  if (props.as) {
    const { as, block: __, className: ___, size: ____, variant: _, ...rest } = props;
    const Root = as as "span";
    return <Root {...rest} className={className} />;
  }

  const { block: __, className: ___, size: ____, variant: _, ...rest } = props;
  return <button {...rest} className={className} />;
}

export const ButtonLink = Button as (
  props: ButtonLinkProps,
) => React.JSX.Element;
