import { Autocomplete } from "@base-ui/react/autocomplete";

/**
 * Canonical topic names that the website deduplicates to.
 * @see packages/web/src/lib/api.ts — unifySimilarTopics
 */
const CANONICAL_TOPICS = [
  "Articles",
  "Community & Events",
  "Tools & Open Source",
  "Tutorials",
  "Videos",
];

export function TopicAutocomplete({
  disabled,
  onSubmit,
  onValueChange,
  value,
}: {
  disabled?: boolean;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <Autocomplete.Root
      items={CANONICAL_TOPICS}
      onValueChange={(v) => onValueChange(v)}
      value={value}
    >
      <Autocomplete.Input
        className="flex-1 px-3 py-2 border border-neu-300 dark:border-neu-600 dark:bg-neu-800 dark:text-neu-100 text-sm focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] outline-none"
        disabled={disabled ?? false}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value && !e.defaultPrevented) {
            onSubmit();
          }
        }}
        placeholder="New topic name..."
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4}>
          <Autocomplete.Popup className="z-50 bg-white dark:bg-neu-800 border border-neu-200 dark:border-neu-700 shadow-lg py-1">
            <Autocomplete.Empty className="px-3 py-2 text-sm text-neu-500 dark:text-neu-400">
              No matching topics
            </Autocomplete.Empty>
            <Autocomplete.List>
              {(topic: string) => (
                <Autocomplete.Item
                  className="px-3 py-1.5 text-sm text-neu-900 dark:text-neu-100 cursor-default data-[highlighted]:bg-neu-100 dark:data-[highlighted]:bg-neu-700"
                  key={topic}
                  value={topic}
                >
                  {topic}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
