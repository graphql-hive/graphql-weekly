import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "../components/Button";
import { ErrorText } from "../components/ErrorText";
import { Input } from "../components/Input";
import {
  type AllIssuesQuery,
  useCreateIssueMutation,
} from "../generated/graphql";
import { replaceTempIdInCache } from "../optimistic-cache";

interface IssueCreatorProps {
  defaultValue?: string;
  refresh?: () => void;
}

const ISSUE_NUMBER_INPUT_ID = "issue-creator-input";

export function IssueCreator({ defaultValue, refresh }: IssueCreatorProps) {
  const qc = useQueryClient();
  const [numberError, setNumberError] = useState("");

  const createIssueMutation = useCreateIssueMutation();

  const handleClick = () => {
    const input = document.getElementById(
      ISSUE_NUMBER_INPUT_ID,
    ) as HTMLInputElement | null;
    const number = input?.value ?? "";

    if (!number || Number.isNaN(Number(number))) {
      setNumberError("Must supply a valid Issue Number");
      return;
    }

    const variables = {
      date: new Date().toISOString(),
      number: Number.parseInt(number, 10),
      published: false,
      title: `Issue ${number}`,
    };

    // Optimistic update
    const optimisticIssue = {
      __typename: "Issue" as const,
      date: variables.date,
      id: `temp-${Date.now()}`,
      published: variables.published,
      title: variables.title,
    };

    // Clear input immediately
    if (input) input.value = "";

    // Optimistic update - use setQueriesData to match any AllIssues query regardless of variables
    qc.setQueriesData<AllIssuesQuery>({ queryKey: ["AllIssues"] }, (old) => {
      if (!old) return old;
      return {
        ...old,
        allIssues: [optimisticIssue, ...(old.allIssues ?? [])],
      };
    });

    createIssueMutation.mutate(variables, {
      onError: (error) => {
        // Rollback on error - restore input value
        if (input) input.value = number;

        qc.setQueriesData<AllIssuesQuery>(
          { queryKey: ["AllIssues"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              allIssues:
                old.allIssues?.filter((i) => i.id !== optimisticIssue.id) ??
                null,
            };
          },
        );
        setNumberError(
          error instanceof Error ? error.message : "Error creating issue",
        );
      },
      onSettled: () => {
        // Refetch to get real data
        refresh?.();
      },
      onSuccess: (data) => {
        // Replace temp-ID with real ID in cache immediately (don't wait for refetch)
        const realId = data.createIssue?.id;
        if (realId) {
          replaceTempIdInCache<AllIssuesQuery>(
            qc,
            ["AllIssues"],
            "allIssues",
            optimisticIssue.id,
            realId,
          );
        }
      },
    });
  };

  const isAddButtonDisabled = createIssueMutation.isPending;

  return (
    <>
      <div className="flex items-stretch gap-2.5">
        <label
          className={`
            flex items-center flex-1 min-w-0
            px-4 py-3 text-sm border border-neu-300
            focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]
            dark:bg-neu-800 dark:border-neu-700
            ${createIssueMutation.isPending ? "italic bg-neu-200" : ""}
          `}
          htmlFor={ISSUE_NUMBER_INPUT_ID}
        >
          <span className="text-neu-400 dark:text-neu-500 shrink-0">
            issue number
          </span>
          <Input
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-right dark:text-neu-100 placeholder:text-neu-400 dark:placeholder:text-neu-600 !p-0 !shadow-none"
            defaultValue={defaultValue}
            disabled={createIssueMutation.isPending}
            id={ISSUE_NUMBER_INPUT_ID}
            placeholder="Number"
          />
        </label>
        <Button
          className="shrink-0"
          disabled={isAddButtonDisabled}
          onClick={handleClick}
        >
          Add Issue
        </Button>
      </div>
      {numberError && <ErrorText>{numberError}</ErrorText>}
    </>
  );
}
