import { signIn, signOut, useSession } from "../client/auth";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="w-8 h-8 bg-neu-200 dark:bg-neu-700 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <button
        className="px-3 py-1.5 text-sm text-neu-600 dark:text-neu-200 border border-neu-200 dark:border-neu-700 hover:bg-neu-100 dark:hover:bg-neu-800"
        onClick={() => signIn.social({ provider: "github" })}
        type="button"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image ? (
        <img
          alt={session.user.name || "User"}
          className="w-8 h-8 bg-neu-200 dark:bg-neu-700"
          src={session.user.image}
        />
      ) : (
        <div className="w-8 h-8 bg-neu-200 dark:bg-neu-700 flex items-center justify-center text-xs text-neu-500">
          {session.user.name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <span className="text-sm text-neu-600 dark:text-neu-300 hidden sm:block">
        {session.user.name || session.user.email}
      </span>
      <button
        className="px-2 py-1 text-xs text-neu-500 dark:text-neu-400 hover:text-neu-700 dark:hover:text-neu-200"
        onClick={() => signOut()}
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
