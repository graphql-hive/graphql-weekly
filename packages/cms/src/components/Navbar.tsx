import type { ReactNode } from "react";

const BASE_PATH = import.meta.env.BASE_URL || "/admin";

interface NavbarProps {
  children?: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="relative z-10 bg-white dark:bg-neu-900 shadow-xs dark:shadow-none dark:border-b dark:border-neu-800 w-screen flex h-12 shrink-0 items-center justify-center">
      <a
        className="absolute left-4 text-neu-600 dark:text-neu-200 text-xl no-underline"
        href={BASE_PATH}
      >
        qlator
      </a>
      {children && (
        <div className="w-full max-w-4xl flex items-center justify-between gap-4 px-4">
          {children}
        </div>
      )}
    </div>
  );
}
