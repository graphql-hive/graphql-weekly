import { useState, ChangeEvent } from "react";
import InputWithButton from "../components/InputWithButton";
import { useCreateLinkMutation } from "../generated/graphql";

interface LinkCreatorProps {
  refresh?: () => void;
}

export default function LinkCreator({ refresh }: LinkCreatorProps) {
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const createLinkMutation = useCreateLinkMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
    setLinkError(
      /^https?:\/\/.+/.test(e.target.value) ? "" : "This is not a valid url"
    );
  };

  const submitChange = () => {
    if (!link) {
      setLinkError("Must supply a valid Link");
      return;
    }

    createLinkMutation.mutate(
      { url: link },
      {
        onSuccess: () => {
          setLink("");
          setLinkError("");
          refresh?.();
        },
        onError: () => {
          setLinkError("Error while submitting");
        },
      }
    );
  };

  const isAddButtonDisabled = createLinkMutation.isPending || linkError !== "";

  return (
    <InputWithButton
      value={link}
      disabled={createLinkMutation.isPending}
      placeholder="Link"
      onClick={submitChange}
      onChange={handleChange}
      buttonLabel="Add Link"
      buttonDisabled={isAddButtonDisabled}
      errorText={linkError}
    />
  );
}
