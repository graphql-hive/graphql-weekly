import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "../components/Navbar";
import IssueCreator from "../product/IssueCreator";
import Loading from "../components/Loading";
import { useAllIssuesQuery } from "../generated/graphql";
import { useQueryClient } from "@tanstack/react-query";

export default function IndexPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAllIssuesQuery();

  // TODO: This shouldn't be in state, because the perf isn't great.
  // We should just use the focus activeElement and manage it with keyboard events.
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [, navigate] = useLocation();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["AllIssues"] });
  };

  const issues = [...(data?.allIssues ?? [])].sort((a, b) => {
    const aNum = parseInt(a.title?.split(" ")[1] ?? "0", 10);
    const bNum = parseInt(b.title?.split(" ")[1] ?? "0", 10);
    return bNum - aNum;
  });

  // Calculate next issue number
  const highestIssueNum =
    issues.length > 0
      ? parseInt(issues[0]?.title?.split(" ")[1] ?? "0", 10)
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
          if (selectedIndex === 0) {
            // Focus the input when at top
            inputRef.current?.focus();
          } else {
            setSelectedIndex((i) => Math.max(i - 1, 0));
          }
          break;
        case "Enter":
          e.preventDefault();
          if (issues[selectedIndex]?.id) {
            navigate(`/issue/${issues[selectedIndex].id}`);
          }
          break;
        case "Home":
        case "g":
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case "End":
        case "G":
          e.preventDefault();
          setSelectedIndex(issues.length - 1);
          break;
      }
    },
    [issues, selectedIndex, navigate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neu-50 dark:bg-neu-950">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const issueNum = (issue: (typeof issues)[0]) =>
    issue.title?.split(" ")[1] ?? "0";

  return (
    <div className="min-h-screen xl:h-screen xl:overflow-hidden xl:flex xl:flex-col bg-neu-50 dark:bg-neu-950">
      <Navbar />

      {/* xl: layout with scrollable main */}
      <div className="xl:flex xl:flex-1 xl:min-h-0 xl:max-w-4xl xl:mx-auto xl:gap-8">
        {/* Header - static on xl */}
        <div className="xl:w-60 xl:shrink-0 xl:py-8">
          <div className="px-4 py-6 xl:py-0">
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

        {/* Main content - scrollable */}
        <main className="flex-1 px-4 pb-16 xl:py-8 xl:overflow-y-auto">
          {/* Add issue form */}
          <div className="mb-4 p-3 bg-white dark:bg-neu-900  border border-neu-200 dark:border-neu-800">
            <IssueCreator
              refresh={refresh}
              defaultValue={nextIssueNum}
              inputRef={inputRef}
            />
          </div>
          <div
            ref={listRef}
            className="bg-white dark:bg-neu-900  border border-neu-200 dark:border-neu-800 overflow-hidden"
          >
            {issues.map((issue, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Link
                  key={issue.id}
                  href={`/issue/${issue.id}`}
                  className={`flex items-center justify-between px-4 py-2.5 border-b border-neu-100 dark:border-neu-800 last:border-b-0 no-underline hover:duration-0 ${
                    isSelected
                      ? "bg-neu-100 dark:bg-neu-800"
                      : "hover:bg-neu-50 dark:hover:bg-neu-800/50"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {/* Issue number */}
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      isSelected
                        ? "text-neu-900 dark:text-neu-100 "
                        : "text-neu-600 dark:text-neu-400"
                    }`}
                  >
                    #{issueNum(issue)}
                  </span>

                  {/* Right side: date + status */}
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
                      <span className="text-xs uppercase text-amber-600 dark:text-amber-400 px-1.5 py-0.5 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
                        draft
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>

      {/* Keyboard hints - bottom-left, xl: only */}
      <footer className="hidden xl:block fixed bottom-0 left-0 py-3 px-4">
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
