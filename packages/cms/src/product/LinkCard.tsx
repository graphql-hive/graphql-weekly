import { OpenPanel } from "../components/Panels";
import ClickTarget from "../components/ClickTarget";
import TopicDialog from "./TopicDialog";

interface Link {
  id?: string | null;
  title?: string | null;
  text?: string | null;
  url?: string | null;
  topic?: { id?: string | null; position?: number | null } | null;
}

interface Topic {
  id?: string | null;
  title?: string | null;
  position?: number | null;
}

interface LinkCardProps {
  link: Link;
  topics: Topic[];
  onChange: (link: Link) => void;
  onDelete: () => void;
  refresh: () => void;
}

export default function LinkCard({
  link,
  topics,
  onChange,
  onDelete,
  refresh,
}: LinkCardProps) {
  return (
    <div className="group flex bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="w-8 flex items-center justify-center opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing shrink-0 border-r border-gray-100">
        <svg
          className="w-4 h-4 text-gray-400"
          viewBox="0 0 24 24"
          fill="currentColor"
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
          type="text"
          placeholder="Title"
          value={link.title ?? ""}
          onChange={(e) => onChange({ ...link, title: e.target.value })}
          className="w-full text-sm font-medium text-gray-900 bg-transparent border border-transparent rounded px-1 py-0.5 hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
        <textarea
          placeholder="Description"
          value={link.text ?? ""}
          onChange={(e) => onChange({ ...link, text: e.target.value })}
          rows={2}
          className="w-full text-sm text-gray-600 bg-transparent border border-transparent rounded px-1 py-0.5 hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-colors"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="URL"
            value={link.url ?? ""}
            onChange={(e) => onChange({ ...link, url: e.target.value })}
            className="flex-1 text-xs text-gray-500 bg-transparent border border-transparent rounded px-1 py-0.5 font-mono hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
          {link.url && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <OpenPanel>
          {({ showPanel }) => (
            <ClickTarget
              onClick={() =>
                showPanel(TopicDialog as any, {
                  link,
                  linkId: link.id,
                  topics,
                  refresh,
                })
              }
            >
              <div
                className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors"
                title="Assign to topic"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </ClickTarget>
          )}
        </OpenPanel>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
