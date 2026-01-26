import type { ReactNode } from "react";

import { cn } from "../cn";

const variantClasses = {
  draft: "text-neu-500 dark:text-neu-400 border-neu-300 dark:border-neu-700",
  live: "text-lime-800 border-lime-500 bg-lime-100 dark:text-primary dark:border-primary/30 dark:bg-primary/10",
  published:
    "text-neu-500 dark:text-neu-400 border-neu-200 dark:border-neu-700 bg-neu-100 dark:bg-neu-800",
  warning:
    "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950",
} satisfies Record<string, string>;

export type TagVariant = keyof typeof variantClasses;

interface TagProps {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
  variant?: TagVariant;
}

export function Tag({
  children,
  className,
  pulse,
  variant = "draft",
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs uppercase tracking-wider px-1.5 py-0.5 border",
        variantClasses[variant],
        className,
      )}
    >
      {pulse && <span className="size-1.5 bg-current animate-pulse" />}
      {children}
    </span>
  );
}
