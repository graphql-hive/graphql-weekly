import { UserProfile } from "./user-profile";

const BASE_PATH = import.meta.env.BASE_URL || "/";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 bg-white dark:bg-neu-900 shadow-xs dark:shadow-none dark:border-b dark:border-neu-800 w-screen flex h-12 shrink-0 items-center justify-between px-4">
      <a
        className="text-neu-600 dark:text-neu-200 text-xl no-underline"
        href={BASE_PATH}
      >
        qlator
      </a>
      <div className="relative -right-2">
        <UserProfile />
      </div>
    </nav>
  );
}
