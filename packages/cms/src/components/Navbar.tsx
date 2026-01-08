import { ReactNode } from "react";
import { Link } from "wouter";

interface NavbarProps {
  children?: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="relative z-10 bg-white shadow-[0px_3px_3px_rgba(12,52,75,0.05)] w-screen flex h-12 flex-shrink-0 items-center justify-between px-4">
      <Link href="/" className="text-[#3d556b] text-xl font-semibold no-underline">
        qlator
      </Link>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  );
}
