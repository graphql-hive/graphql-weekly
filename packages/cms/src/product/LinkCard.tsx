import { OpenPanel } from "../components/Panels";
import ClickTarget from "../components/ClickTarget";
import LinkIcon from "../icons/Link";
import TopicDialog from "./TopicDialog";

interface Link {
  id: string;
  title: string;
  text: string;
  url: string;
  topic: { id: string; position: number } | null;
}

interface Topic {
  id: string;
  title: string;
  position: number;
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
    <div className="group border-b border-[#CCD9DF] px-3 py-2 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            type="text"
            placeholder="Title"
            value={link.title}
            onChange={(e) => onChange({ ...link, title: e.target.value })}
            className="w-full text-sm font-medium text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 outline-none px-0 py-0.5 transition-colors"
          />
          <textarea
            placeholder="Description"
            value={link.text}
            onChange={(e) => onChange({ ...link, text: e.target.value })}
            rows={2}
            className="w-full text-sm text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 outline-none px-0 py-0.5 resize-none transition-colors leading-snug"
          />
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="URL"
              value={link.url}
              onChange={(e) => onChange({ ...link, url: e.target.value })}
              className="flex-1 text-xs text-slate-500 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 outline-none px-0 py-0.5 font-mono transition-colors"
            />
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-500 transition-colors shrink-0"
                title="Open link"
              >
                <svg
                  className="w-3.5 h-3.5"
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

        <div className="flex items-center gap-1 pt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
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
                <div className="p-1 hover:bg-slate-200 rounded transition-colors">
                  <LinkIcon />
                </div>
              </ClickTarget>
            )}
          </OpenPanel>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
    </div>
  );
}
