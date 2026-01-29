import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, RefObject, useEffect, useRef, useState } from "react";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  type AllIssuesQuery,
  useCreateIssueMutation,
} from "../generated/graphql";

interface IssueCreatorProps {
  defaultValue?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  refresh?: () => void;
}

export function IssueCreator({
  defaultValue,
  inputRef,
  refresh,
}: IssueCreatorProps) {
  const qc = useQueryClient();
  const [number, setNumber] = useState(defaultValue ?? "");
  const [numberError, setNumberError] = useState("");
  const wasCleared = useRef(false);

  // Update when defaultValue changes (but not after intentional clear)
  useEffect(() => {
    if (wasCleared.current) {
      wasCleared.current = false;
      return;
    }
    if (defaultValue && number === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from props
      setNumber(defaultValue);
    }
  }, [defaultValue, number]);

  const createIssueMutation = useCreateIssueMutation();

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNumber(e.target.value);
    setNumberError("");
  };

  const submitIssueChange = () => {
    if (!number) {
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

    wasCleared.current = true;
    setNumber("");

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
        // Rollback on error
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
        setNumber(number);
        setNumberError(
          error instanceof Error ? error.message : "Error creating issue",
        );
      },
      onSettled: () => {
        // Refetch to get real data
        refresh?.();
      },
    });
  };

  const isAddButtonDisabled =
    createIssueMutation.isPending ||
    number === "" ||
    Number.isNaN(Number(number));

  return (
    <div className="flex items-center gap-2.5">
      <Input
        disabled={createIssueMutation.isPending}
        error={numberError}
        label="issue number"
        onChange={handleNumberChange}
        placeholder="Number"
        ref={inputRef}
        value={number}
      />
      <Button disabled={isAddButtonDisabled} onClick={submitIssueChange}>
        Add Issue
      </Button>
    </div>
  );
}
