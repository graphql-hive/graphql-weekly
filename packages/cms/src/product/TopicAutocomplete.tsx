import type React from "react";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { useMemo } from "react";

import { useTopTopicTitlesQuery } from "../generated/graphql";

const FETCH_LIMIT = 20;
const INITIAL_DISPLAY_LIMIT = 5;

export function TopicAutocomplete({
  disabled,
  inputRef,
  onValueChange,
  value,
}: {
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange: (value: string) => void;
  value: string;
}) {
  const { data } = useTopTopicTitlesQuery({ limit: FETCH_LIMIT });

  const allSuggestions = useMemo(
    () =>
      (data?.allTopics ?? [])
        .map((t) => t.title)
        .filter((t): t is string => t != null),
    [data],
  );

  // Show top 5 when dropdown opens; filter from all 20 when typing
  const suggestions = useMemo(
    () =>
      value ? allSuggestions : allSuggestions.slice(0, INITIAL_DISPLAY_LIMIT),
    [allSuggestions, value],
  );

  return (
    <Autocomplete.Root
      items={suggestions}
      onValueChange={(v) => onValueChange(v ?? "")}
      openOnInputClick
      submitOnItemClick
      value={value}
    >
      <Autocomplete.Input
        className="flex-1 px-3 py-2 border border-neu-300 dark:border-neu-600 dark:bg-neu-800 dark:text-neu-100 text-sm focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] outline-none"
        disabled={disabled ?? false}
        placeholder="New topic name..."
        ref={inputRef}
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner side="top" sideOffset={4}>
          <Autocomplete.Popup className="z-50 min-w-[var(--anchor-width)] bg-white dark:bg-neu-800 border border-neu-200 dark:border-neu-700 shadow-lg">
            <Autocomplete.Empty className="empty:hidden px-3 py-2 text-sm text-neu-500 dark:text-neu-400">
              No matching topics
            </Autocomplete.Empty>
            <Autocomplete.List>
              {(topic: string) => (
                <Autocomplete.Item
                  className="px-3 py-1.5 text-sm text-neu-900 dark:text-neu-100 cursor-default data-highlighted:bg-neu-100 dark:data-highlighted:bg-neu-700"
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
