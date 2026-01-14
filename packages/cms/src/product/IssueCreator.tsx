import { ChangeEvent, RefObject, useEffect, useState } from "react";

import InputWithButton from "../components/InputWithButton";
import { useCreateIssueMutation } from "../generated/graphql";

interface IssueCreatorProps {
  defaultValue?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  refresh?: () => void;
}

export default function IssueCreator({
  defaultValue,
  inputRef,
  refresh,
}: IssueCreatorProps) {
  const [number, setNumber] = useState(defaultValue ?? "");
  const [numberError, setNumberError] = useState("");

  // Update when defaultValue changes
  useEffect(() => {
    if (defaultValue && number === "") {
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

    createIssueMutation.mutate(
      {
        date: new Date().toISOString(),
        number: Number.parseInt(number, 10),
        published: false,
        title: `Issue ${number}`,
      },
      {
        onError: (error) => {
          setNumberError(
            error instanceof Error ? error.message : "Error creating issue",
          );
        },
        onSuccess: () => {
          setNumber("");
          setNumberError("");
          refresh?.();
        },
      },
    );
  };

  const isAddButtonDisabled =
    createIssueMutation.isPending || number === "" || isNaN(Number(number));

  return (
    <InputWithButton
      buttonDisabled={isAddButtonDisabled}
      buttonLabel="Add Issue"
      disabled={createIssueMutation.isPending}
      errorText={numberError}
      inputRef={inputRef}
      label="issue number"
      onChange={handleNumberChange}
      onClick={submitIssueChange}
      placeholder="Number"
      value={number}
    />
  );
}
