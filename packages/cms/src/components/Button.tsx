import type React from "react";
import type { ComponentProps, DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "../cn";

const variantClasses = {
  danger:
    "bg-transparent text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white hover:border-red-500",
  primary: "bg-primary text-neu-900 border-primary hover:bg-primary/80",
  secondary:
    "bg-transparent text-neu-600 dark:text-neu-300 border-neu-300 dark:border-neu-600 hover:bg-neu-100 dark:hover:bg-neu-800",
} satisfies Record<string, string>;

export type ButtonVariant = keyof typeof variantClasses;

const sizeClasses = {
  md: "h-10 py-3 px-4 text-sm [&.Button--square]:p-0",
  sm: "h-7 py-1.5 px-3 text-xs [&.Button--square]:p-0",
  xs: "h-5 py-0.5 px-1.5 text-[10px] [&.Button--square]:p-0",
} satisfies Record<string, string>;

export type ButtonSize = keyof typeof sizeClasses;

const baseClasses =
  "border box-border outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 uppercase leading-none disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";

interface ButtonBaseProps {
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  square?: boolean;
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
    props.disabled && "opacity-30 pointer-events-none",
    props.className,
    props.square && "Button--square aspect-square",
  );

  if ("href" in props && typeof props.href === "string") {
    const {
      as: ___,
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
    const {
      as,
      className: _1,
      size: _2,
      square: _4,
      variant: _3,
      ...rest
    } = props;
    const Root = as as "span";
    return <Root {...rest} className={className} />;
  }

  const { className: _1, size: _2, square: _4, variant: _3, ...rest } = props;
  return <button {...rest} className={className} />;
}

export const ButtonLink = Button as (
  props: ButtonLinkProps,
) => React.JSX.Element;
