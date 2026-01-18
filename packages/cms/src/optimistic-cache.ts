import type { QueryClient } from "@tanstack/react-query";

/**
 * Replace a temp-ID with a real ID in the React Query cache.
 * Used after optimistic updates when the server returns the real ID.
 *
 * @param qc - QueryClient instance
 * @param queryKey - The query key to update (e.g., ["AllIssues"] or ["AllLinks"])
 * @param itemsKey - The key in the query data that contains the array (e.g., "allIssues" or "allLinks")
 * @param tempId - The temporary ID to replace
 * @param realId - The real ID from the server
 */
export function replaceTempIdInCache<
  TQueryData extends Record<string, unknown>,
>(
  qc: QueryClient,
  queryKey: unknown[],
  itemsKey: keyof TQueryData,
  tempId: string,
  realId: string,
): void {
  qc.setQueriesData<TQueryData>({ queryKey }, (old) => {
    if (!old) return old;
    const items = old[itemsKey];
    if (!Array.isArray(items)) return old;
    return {
      ...old,
      [itemsKey]: items.map((item: { id?: string }) =>
        item.id === tempId ? { ...item, id: realId } : item,
      ),
    } as TQueryData;
  });
}
