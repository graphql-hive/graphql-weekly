import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDrag } from "@use-gesture/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useLinkSubmissionsQuery } from "../generated/graphql";

export const SUBMISSION_PREFIX = "submission:";
const CONSUMED_KEY = "consumedSubmissions";

export function getConsumedSubmissions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CONSUMED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markSubmissionConsumed(id: string) {
  const consumed = getConsumedSubmissions();
  if (!consumed.includes(id)) {
    consumed.push(id);
    localStorage.setItem(CONSUMED_KEY, JSON.stringify(consumed));
    globalThis.dispatchEvent(new Event("submissions-consumed"));
  }
}

interface DraggableSubmissionProps {
  createdAt: string | null | undefined;
  description: string | null | undefined;
  id: string;
  name: string | null | undefined;
  title: string | null | undefined;
  url: string | null | undefined;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 10);
}

function DraggableSubmission({
  createdAt,
  description,
  id,
  name,
  title,
  url,
}: DraggableSubmissionProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      data: { description, id, name, title, type: "submission", url },
      id: `${SUBMISSION_PREFIX}${id}`,
    });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 border-b border-neu-200 dark:border-neu-700 bg-white dark:bg-neu-900 hover:bg-neu-50 dark:hover:bg-neu-800 cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="text-sm text-neu-900 dark:text-neu-100 truncate">
        {title || "Untitled"}
      </div>
      {description && (
        <div className="text-xs text-neu-500 dark:text-neu-400 truncate mt-0.5">
          {description}
        </div>
      )}
      <div className="text-xs text-neu-400 dark:text-neu-500 truncate font-mono mt-1">
        {url}
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-neu-400 dark:text-neu-500">
        {name && <span>by {name}</span>}
        {createdAt && <span>{formatDate(createdAt)}</span>}
      </div>
    </div>
  );
}

export function SubmissionsPanel(): React.ReactNode {
  const [position, setPosition] = useState(() => ({
    x: 20,
    y: globalThis.window === undefined ? 20 : window.innerHeight - 60,
  }));
  const [size, setSize] = useState({ height: 384, width: 320 });
  const [minimized, setMinimized] = useState(true);
  const [consumed, setConsumed] = useState<string[]>(getConsumedSubmissions);

  const panelHeight = minimized ? 44 : size.height;
  const minTop = 48; // clear the navbar (h-12)
  const clampedLeft = Math.max(
    0,
    Math.min(position.x, window.innerWidth - size.width),
  );
  const clampedTop = Math.max(
    minTop,
    Math.min(position.y, window.innerHeight - panelHeight),
  );

  const bindPanelDrag = useDrag(
    ({ offset: [x, y] }) => {
      setPosition({
        x: Math.max(0, Math.min(x, window.innerWidth - size.width)),
        y: Math.max(minTop, Math.min(y, window.innerHeight - panelHeight)),
      });
    },
    { from: () => [position.x, position.y] },
  );

  // Listen for consumed changes
  useEffect(() => {
    const handleConsumed = () => setConsumed(getConsumedSubmissions());
    globalThis.addEventListener("submissions-consumed", handleConsumed);
    globalThis.addEventListener("storage", handleConsumed);
    return () => {
      globalThis.removeEventListener("submissions-consumed", handleConsumed);
      globalThis.removeEventListener("storage", handleConsumed);
    };
  }, []);

  const { data, isLoading } = useLinkSubmissionsQuery();
  const totalCount = data?.linkSubmissions.totalCount ?? 0;
  const submissions = useMemo(
    () =>
      data?.linkSubmissions.items.filter(
        (s) => s.id && !consumed.includes(s.id),
      ) ?? [],
    [data, consumed],
  );

  const bindResize = useDrag(
    ({ offset: [x, y] }) => {
      setSize({
        height: Math.max(150, y),
        width: Math.max(200, x),
      });
    },
    {
      from: () => [size.width, size.height],
    },
  );

  return createPortal(
    <div
      className="fixed z-10 bg-white dark:bg-neu-900 border border-neu-300 dark:border-neu-600 shadow-sm"
      style={{
        height: minimized ? "auto" : size.height,
        left: clampedLeft,
        top: clampedTop,
        width: size.width,
      }}
    >
      <div
        {...bindPanelDrag()}
        className="flex items-center justify-between px-3 py-2 bg-neu-100 dark:bg-neu-800 cursor-move select-none touch-none"
      >
        <span className="text-sm text-neu-700 dark:text-neu-200">
          Submissions{" "}
          {totalCount > 100
            ? `(first 100 of ${totalCount})`
            : `(${submissions.length})`}
        </span>
        <button
          aria-label={minimized ? "Expand panel" : "Minimize panel"}
          className="p-1 text-neu-500 dark:text-neu-400 hover:text-neu-700 dark:hover:text-neu-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setMinimized(!minimized)}
        >
          {minimized ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 15l7-7 7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          )}
        </button>
      </div>

      {!minimized && (
        <>
          <div className="overflow-y-auto" style={{ height: size.height - 44 }}>
            {isLoading ? (
              <div className="p-4 text-center text-neu-500 dark:text-neu-400 text-sm">
                Loading...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-4 text-center text-neu-500 dark:text-neu-400 text-sm">
                No submissions
              </div>
            ) : (
              submissions.map((submission) =>
                submission.id ? (
                  <DraggableSubmission
                    createdAt={submission.createdAt}
                    description={submission.description}
                    id={submission.id}
                    key={submission.id}
                    name={submission.name}
                    title={submission.title}
                    url={submission.url}
                  />
                ) : null,
              )
            )}
          </div>
          <div
            {...bindResize()}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none"
          >
            <svg
              className="w-4 h-4 text-neu-400"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
            </svg>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
