import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../cn";
import { Navbar } from "../components/Navbar";
import {
  type AllIssuesQuery,
  useAllIssuesQuery,
  useDeleteIssueMutation,
} from "../generated/graphql";
import { IssueCreator } from "../product/IssueCreator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false, // Fetcher has its own retry logic for transient errors
      staleTime: 1000 * 60,
    },
  },
});

type Issue = NonNullable<AllIssuesQuery["allIssues"]>[number];

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface Props {
  initialIssues: Issue[];
}

export function IndexPage({ initialIssues }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <IndexPageContent initialIssues={initialIssues} />
    </QueryClientProvider>
  );
}

function IndexPageContent({ initialIssues }: Props) {
  const qc = useQueryClient();
  const deleteIssueMutation = useDeleteIssueMutation();
  const { data } = useAllIssuesQuery(undefined, {
    initialData: { allIssues: initialIssues },
  });

  // TODO: This shouldn't be in state, because the perf isn't great.
  // We should just use the focus activeElement and manage it with keyboard events.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["AllIssues"] });
  };

  const issues = [...(data?.allIssues ?? [])].sort((a, b) => {
    const aNum = Number.parseInt(a.title?.split(" ")[1] ?? "0", 10);
    const bNum = Number.parseInt(b.title?.split(" ")[1] ?? "0", 10);
    return bNum - aNum;
  });

  // Calculate next issue number
  const highestIssueNum =
    issues.length > 0
      ? Number.parseInt(issues[0]?.title?.split(" ")[1] ?? "0", 10)
      : 0;
  const nextIssueNum = String(highestIssueNum + 1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, issues.length - 1));
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "End":
        case "G":
          e.preventDefault();
          setSelectedIndex(issues.length - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (issues[selectedIndex]?.id) {
            globalThis.location.href = `/issue/${issues[selectedIndex].id}`;
          }
          break;
        case "g":
        case "Home":
          e.preventDefault();
          setSelectedIndex(0);
          break;
      }
    },
    [issues, selectedIndex],
  );

  useEffect(() => {
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  const issueNum = (issue: (typeof issues)[0]) =>
    issue.title?.split(" ")[1] ?? "0";

  const handleDelete = (issue: Issue, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete issue #${issueNum(issue)}?`)) return;
    deleteIssueMutation.mutate(
      { id: issue.id! },
      {
        onSuccess: () => {
          qc.setQueriesData<AllIssuesQuery>(
            { queryKey: ["AllIssues"] },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                allIssues:
                  old.allIssues?.filter((i) => i.id !== issue.id) ?? null,
              };
            },
          );
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "min-h-screen md:h-screen md:overflow-hidden md:flex md:flex-col bg-neu-50 dark:bg-neu-950",
        deleteIssueMutation.isPending && "cursor-progress",
      )}
    >
      <Navbar />

      <div className="md:flex md:flex-1 md:min-h-0 md:max-w-4xl md:mx-auto md:gap-8">
        <div className="md:w-60 md:shrink-0 md:py-8">
          <div className="px-4 py-6 md:py-0">
            <h1 className="text-2xl text-neu-900 dark:text-neu-100 mb-1 tracking-tight">
              GraphQL Weekly
            </h1>
            <p className="text-sm text-neu-500 dark:text-neu-400">
              {issues.length} issues
              <br />
              {issues.filter((i) => i.published).length} published
            </p>
          </div>
        </div>

        <main className="flex-1 px-4 pb-16 md:py-8 md:overflow-y-auto">
          <div className="mb-4 p-3 bg-white dark:bg-neu-900  border border-neu-200 dark:border-neu-800">
            <IssueCreator defaultValue={nextIssueNum} refresh={refresh} />
          </div>
          <div
            className="bg-white dark:bg-neu-900  border border-neu-200 dark:border-neu-800 overflow-hidden"
            ref={listRef}
          >
            {issues.map((issue, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  className="group relative border-b border-neu-100 dark:border-neu-800 last:border-b-0"
                  key={issue.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <a
                    className={`flex items-center justify-between px-4 py-2.5 no-underline hover:duration-0 ${
                      isSelected
                        ? "bg-neu-100 dark:bg-neu-800"
                        : "hover:bg-neu-50 dark:hover:bg-neu-800/50"
                    }`}
                    href={`/issue/${issue.id}`}
                  >
                    <span
                      className={`font-mono text-sm tabular-nums ${
                        isSelected
                          ? "text-neu-900 dark:text-neu-100 "
                          : "text-neu-600 dark:text-neu-400"
                      }`}
                    >
                      #{issueNum(issue)}
                    </span>
                    <div className="flex items-center gap-3">
                      {issue.date && (
                        <span className="text-sm tabular-nums text-neu-400 dark:text-neu-500">
                          {formatDate(issue.date)}
                        </span>
                      )}
                      {issue.published ? (
                        <span className="text-xs uppercase text-neu-500 dark:text-neu-400 px-1.5 py-0.5 border border-neu-200 dark:border-neu-700 bg-neu-100 dark:bg-neu-800">
                          published
                        </span>
                      ) : (
                        <span className="text-xs uppercase text-amber-600 dark:text-amber-400 px-1.5 py-0.5 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 group-hover:invisible">
                          draft
                        </span>
                      )}
                    </div>
                  </a>
                  {!issue.published && (
                    <button
                      aria-label="Delete issue"
                      className="absolute right-4 top-1/2 -translate-y-1/2 invisible group-hover:visible text-base leading-none text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-1.5 py-0.5 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={(e) => handleDelete(issue, e)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <footer className="hidden md:block fixed bottom-0 left-0 py-3 px-4">
        <div className="flex items-center gap-4 text-[11px] text-neu-400 dark:text-neu-600 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-neu-200/50 dark:bg-neu-800/50  text-[10px]">
              ↑↓
            </kbd>
            nav
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-neu-200/50 dark:bg-neu-800/50  text-[10px]">
              ↵
            </kbd>
            open
          </span>
        </div>
      </footer>
    </div>
  );
}
