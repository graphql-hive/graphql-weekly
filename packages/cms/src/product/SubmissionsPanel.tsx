import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAllLinkSubmissionsQuery } from "../generated/graphql";

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
    window.dispatchEvent(new Event("submissions-consumed"));
  }
}

interface DraggableSubmissionProps {
  id: string;
  title: string | null | undefined;
  description: string | null | undefined;
  url: string | null | undefined;
  name: string | null | undefined;
  createdAt: string | null | undefined;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 10);
}

function DraggableSubmission({
  id,
  title,
  description,
  url,
  name,
  createdAt,
}: DraggableSubmissionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${SUBMISSION_PREFIX}${id}`,
      data: { type: "submission", id, title, description, url, name },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
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

export default function SubmissionsPanel() {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 340 : 20,
    y: 100,
  }));
  const [size, setSize] = useState({ width: 320, height: 384 });
  const [minimized, setMinimized] = useState(false);
  const [consumed, setConsumed] = useState<string[]>(getConsumedSubmissions);
  const dragRef = useRef<HTMLDivElement>(null);

  // Listen for consumed changes
  useEffect(() => {
    const handleConsumed = () => setConsumed(getConsumedSubmissions());
    window.addEventListener("submissions-consumed", handleConsumed);
    window.addEventListener("storage", handleConsumed);
    return () => {
      window.removeEventListener("submissions-consumed", handleConsumed);
      window.removeEventListener("storage", handleConsumed);
    };
  }, []);

  const { data, isLoading } = useAllLinkSubmissionsQuery();
  // TODO: add pagination to the backend
  const totalCount = data?.allLinkSubmissions?.length ?? 0;
  const allSubmissions = (data?.allLinkSubmissions ?? []).slice(0, 100);
  const submissions = useMemo(
    () => allSubmissions.filter((s) => s.id && !consumed.includes(s.id)),
    [allSubmissions, consumed],
  );

  const bind = useDrag(
    ({ offset: [x, y] }) => {
      setPosition({ x, y });
    },
    {
      from: () => [position.x, position.y],
      bounds: {
        left: 0,
        top: 0,
        right: window.innerWidth - size.width,
        bottom: window.innerHeight - 60,
      },
    },
  );

  const bindResize = useDrag(
    ({ offset: [x, y] }) => {
      setSize({
        width: Math.max(200, x),
        height: Math.max(150, y),
      });
    },
    {
      from: () => [size.width, size.height],
    },
  );

  return createPortal(
    <div
      className="fixed z-50 bg-white dark:bg-neu-900 border border-neu-300 dark:border-neu-600 shadow-sm"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: minimized ? "auto" : size.height,
      }}
    >
      <div
        ref={dragRef}
        {...bind()}
        className="flex items-center justify-between px-3 py-2 bg-neu-100 dark:bg-neu-800 cursor-move select-none touch-none"
      >
        <span className="text-sm text-neu-700 dark:text-neu-200">
          Submissions{" "}
          {totalCount > 100
            ? `(first 100 of ${totalCount})`
            : `(${submissions.length})`}
        </span>
        <button
          onClick={() => setMinimized(!minimized)}
          className="p-1 text-neu-500 dark:text-neu-400 hover:text-neu-700 dark:hover:text-neu-200 transition-colors"
        >
          {minimized ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
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
                    key={submission.id}
                    id={submission.id}
                    title={submission.title}
                    description={submission.description}
                    url={submission.url}
                    name={submission.name}
                    createdAt={submission.createdAt}
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
              viewBox="0 0 16 16"
              fill="currentColor"
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
