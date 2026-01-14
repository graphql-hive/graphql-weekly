import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface Link {
  id?: string | null;
  text?: string | null;
  title?: string | null;
  topic?: { id?: string | null; position?: number | null } | null;
  url?: string | null;
}

interface LinkCardProps {
  dragListeners?: SyntheticListenerMap;
  isDragOverlay?: boolean;
  link: Link;
  onChange: (link: Link) => void;
  onDelete: () => void;
}

export function LinkCard({
  dragListeners,
  isDragOverlay,
  link,
  onChange,
  onDelete,
}: LinkCardProps) {
  return (
    <div
      className={`group flex bg-white dark:bg-neu-900 border-b border-neu-200 dark:border-neu-700 hover:bg-neu-50 dark:hover:bg-neu-800 transition-colors hover:duration-0 ${isDragOverlay ? "shadow-lg" : ""}`}
    >
      {/* a11y: keyboard support provided by dnd-kit via dragListeners */}
      <div
        className="w-8 flex items-center justify-center opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing shrink-0 border-r border-neu-100 dark:border-neu-800 touch-none"
        {...dragListeners}
      >
        <svg
          className="w-4 h-4 text-neu-400 dark:text-neu-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      <div className="flex-1 p-3 space-y-2 min-w-0">
        <input
          aria-label="Link title"
          className="w-full text-sm  text-neu-900 dark:text-neu-100 bg-transparent border border-transparent  px-1 py-0.5 hover:border-neu-200 dark:hover:border-neu-600 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] transition-colors hover:duration-0"
          onChange={(e) => onChange({ ...link, title: e.target.value })}
          placeholder="Title"
          type="text"
          value={link.title ?? ""}
        />
        <textarea
          aria-label="Link description"
          className="w-full text-sm text-neu-600 dark:text-neu-300 bg-transparent border border-transparent  px-1 py-0.5 hover:border-neu-200 dark:hover:border-neu-600 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] resize-none transition-colors hover:duration-0"
          onChange={(e) => onChange({ ...link, text: e.target.value })}
          placeholder="Description"
          rows={2}
          value={link.text ?? ""}
        />
        <div className="flex items-center gap-2">
          <input
            aria-label="Link URL"
            className="flex-1 text-xs text-neu-500 dark:text-neu-400 bg-transparent border border-transparent  px-1 py-0.5 font-mono hover:border-neu-200 dark:hover:border-neu-600 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] transition-colors hover:duration-0"
            onChange={(e) => onChange({ ...link, url: e.target.value })}
            placeholder="URL"
            type="text"
            value={link.url ?? ""}
          />
          {link.url && (
            <a
              aria-label="Open link in new tab"
              className="text-neu-400 dark:text-neu-500 hover:text-primary transition-colors hover:duration-0"
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity hover:duration-0">
        <button
          aria-label="Delete link"
          className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors hover:duration-0 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={onDelete}
          title="Delete"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
