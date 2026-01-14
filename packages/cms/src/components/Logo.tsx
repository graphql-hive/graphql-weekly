import { PrismaLogo } from "../icons/Prisma";

export function Logo() {
  return (
    <a
      className="bg-[#0c344b] w-14 h-14 flex items-center justify-center"
      href="/"
    >
      <PrismaLogo />
    </a>
  );
}
