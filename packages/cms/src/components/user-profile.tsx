"use client";

import { useEffect, useRef, useState } from "react";

import { signOut, useSession } from "../client/auth";
import { Button } from "./Button";

type IconProps = React.SVGProps<SVGSVGElement>;

function IconLogout(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M5 3h16v4h-2V5H5v14h14v-2h2v4H3V3h2zm16 8h-2V9h-2V7h-2v2h2v2H7v2h10v2h-2v2h2v-2h2v-2h2v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconExternalLink(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M21 11V3h-8v2h4v2h-2v2h-2v2h-2v2H9v2h2v-2h2v-2h2V9h2V7h2v4h2zM11 5H3v16h16v-8h-2v6H5V7h6V5z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCode(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M8 5h2v2H8V5zM6 7h2v2H6V7zM4 9h2v2H4V9zm-2 2h2v2H2v-2zm2 2h2v2H4v-2zm2 2h2v2H6v-2zm2 2h2v2H8v-2zm8-12h-2v2h2V5zm2 2h-2v2h2V7zm2 2h-2v2h2V9zm2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconGithub(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UserAvatar({
  className = "size-8",
  image,
  name,
}: {
  className?: string;
  image?: string | null | undefined;
  name?: string | null | undefined;
}) {
  if (image) {
    return (
      <img
        alt={name || "User"}
        className={`${className} rounded-lg bg-neu-200 dark:bg-neu-700`}
        src={image}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-lg bg-neu-200 dark:bg-neu-700 flex items-center justify-center text-xs font-medium text-neu-600 dark:text-neu-300`}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg p-2">
      <div className="size-8 rounded-lg bg-neu-200 dark:bg-neu-700 animate-pulse" />
      <div className="h-4 w-20 rounded bg-neu-200 dark:bg-neu-700 animate-pulse" />
    </div>
  );
}

const menuItemClass =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-neu-700 dark:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (isPending) {
    return <UserProfileSkeleton />;
  }

  if (!session?.user) {
    return (
      <Button href="/login" size="sm" variant="secondary">
        Log in
      </Button>
    );
  }

  const { user } = session;

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <UserAvatar image={user.image} name={user.name} />
        <span className="text-sm font-medium text-neu-900 dark:text-neu-100 truncate">
          {user.name}
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 min-w-48 rounded-lg border border-neu-200 dark:border-neu-700 bg-white dark:bg-neu-900 shadow-lg py-1"
          role="menu"
        >
          <a
            className={menuItemClass}
            href="https://graphqlweekly.com"
            rel="noopener noreferrer"
            role="menuitem"
            target="_blank"
          >
            <IconExternalLink className="size-4" />
            Website
          </a>
          <a
            className={menuItemClass}
            href="https://graphqlweekly.com/graphql"
            rel="noopener noreferrer"
            role="menuitem"
            target="_blank"
          >
            <IconCode className="size-4" />
            GraphiQL
          </a>
          <a
            className={menuItemClass}
            href="https://github.com/graphql-hive/graphql-weekly"
            rel="noopener noreferrer"
            role="menuitem"
            target="_blank"
          >
            <IconGithub className="size-4" />
            GitHub
          </a>
          <div className="my-1 border-t border-neu-200 dark:border-neu-700" />
          <button
            className={menuItemClass}
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    location.href = "/login";
                  },
                },
              })
            }
            role="menuitem"
            type="button"
          >
            <IconLogout className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
