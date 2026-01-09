import { useState, useEffect, ChangeEvent, RefObject } from "react";
import InputWithButton from "../components/InputWithButton";
import { useCreateIssueMutation } from "../generated/graphql";

interface IssueCreatorProps {
  refresh?: () => void;
  defaultValue?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function IssueCreator({ refresh, defaultValue, inputRef }: IssueCreatorProps) {
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
        title: `Issue ${number}`,
        date: new Date().toISOString(),
        number: parseInt(number, 10),
        published: false,
      },
      {
        onSuccess: () => {
          setNumber("");
          setNumberError("");
          refresh?.();
        },
        onError: (error) => {
          setNumberError(
            error instanceof Error ? error.message : "Error creating issue"
          );
        },
      }
    );
  };

  const isAddButtonDisabled =
    createIssueMutation.isPending || number === "" || isNaN(Number(number));

  return (
    <InputWithButton
      inputRef={inputRef}
      disabled={createIssueMutation.isPending}
      label="issue number"
      placeholder="Number"
      onClick={submitIssueChange}
      onChange={handleNumberChange}
      buttonLabel="Add Issue"
      buttonDisabled={isAddButtonDisabled}
      errorText={numberError}
      value={number}
    />
  );
}
