import { useState, ChangeEvent } from "react";
import InputWithButton from "../components/InputWithButton";
import { useCreateIssueMutation } from "../generated/graphql";

interface IssueCreatorProps {
  refresh?: () => void;
}

export default function IssueCreator({ refresh }: IssueCreatorProps) {
  const [number, setNumber] = useState("");
  const [numberError, setNumberError] = useState("");

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
      disabled={createIssueMutation.isPending}
      placeholder="Issue Number"
      onClick={submitIssueChange}
      onChange={handleNumberChange}
      buttonLabel="Add Issue"
      buttonDisabled={isAddButtonDisabled}
      errorText={numberError}
      value={number}
    />
  );
}
