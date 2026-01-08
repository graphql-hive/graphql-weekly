import type { ComponentProps, CSSProperties } from "react";
import { Link } from "wouter";

type ButtonColor = "red" | "green" | "grey" | "grey-bg";

const colorMap: Record<ButtonColor, string> = {
  red: "white",
  green: "white",
  grey: "#3D556B",
  "grey-bg": "white",
};

const backgroundColorMap: Record<ButtonColor, string> = {
  red: "#ff4f56",
  green: "#15BD76",
  grey: "white",
  "grey-bg": "#8fa6b2",
};

// Precomputed darken(0.04, color) values
const hoverColorMap: Record<ButtonColor, string> = {
  red: "#f53d45",
  green: "#12a86a",
  grey: "#f5f5f5",
  "grey-bg": "#7f96a2",
};

// Precomputed darken(0.07, color) values
const focusColorMap: Record<ButtonColor, string> = {
  red: "#e82d35",
  green: "#0f9560",
  grey: "#ededed",
  "grey-bg": "#728a95",
};

interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  block?: boolean;
  color?: ButtonColor;
  margin?: string;
}

const baseClasses =
  "py-[11px] px-[14px] border-none box-border outline-none uppercase leading-none text-sm font-bold rounded-md shadow-[0px_3px_3px_rgba(12,52,75,0.05)] transition-all duration-200";

export function Button({
  block,
  disabled,
  margin,
  color = "green",
  className,
  style,
  ...props
}: ButtonProps) {
  const combinedStyle: CSSProperties = {
    display: block ? "block" : "inline-block",
    width: block ? "100%" : undefined,
    opacity: disabled ? 0.2 : 1,
    margin: margin ?? 0,
    background: backgroundColorMap[color],
    color: colorMap[color],
    cursor: disabled ? "default" : "pointer",
    pointerEvents: disabled ? "none" : "all",
    // CSS custom properties for hover/focus
    "--btn-hover-bg": hoverColorMap[color],
    "--btn-focus-bg": focusColorMap[color],
    ...style,
  } as CSSProperties;

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseClasses} hover:!bg-[var(--btn-hover-bg)] focus:!bg-[var(--btn-focus-bg)] ${className ?? ""}`}
      style={combinedStyle}
    />
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<"a">, "color" | "href"> {
  to: string;
  block?: boolean;
  disabled?: boolean;
  color?: ButtonColor;
}

export function ButtonLink({
  to,
  block,
  disabled,
  color = "green",
  className,
  style,
  ...props
}: ButtonLinkProps) {
  const combinedStyle: CSSProperties = {
    display: block ? "block" : "inline-block",
    width: block ? "100%" : undefined,
    opacity: disabled ? 0.2 : 1,
    background: backgroundColorMap[color],
    color: colorMap[color],
    cursor: disabled ? "default" : "pointer",
    pointerEvents: disabled ? "none" : "all",
    "--btn-hover-bg": hoverColorMap[color],
    "--btn-focus-bg": focusColorMap[color],
    ...style,
  } as CSSProperties;

  return (
    <Link
      href={to}
      {...props}
      className={`${baseClasses} hover:!bg-[var(--btn-hover-bg)] hover:!text-[${colorMap[color]}] focus:!bg-[var(--btn-focus-bg)] focus:!text-[${colorMap[color]}] ${className ?? ""}`}
      style={combinedStyle}
    />
  );
}
