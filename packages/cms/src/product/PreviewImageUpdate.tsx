import { ChangeEvent, useState } from "react";

import InputWithButton from "../components/InputWithButton";
import { useUpdateIssuePreviewImageMutation } from "../generated/graphql";

interface PreviewImageUpdateProps {
  id?: string | null;
  previewImage?: string | null;
  refresh?: () => void;
}

export default function PreviewImageUpdate({
  id,
  previewImage,
  refresh,
}: PreviewImageUpdateProps) {
  const [link, setLink] = useState(previewImage ?? "");
  const [linkError, setLinkError] = useState("");

  const updatePreviewMutation = useUpdateIssuePreviewImageMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
    setLinkError(
      /^https?:\/\/.+/.test(e.target.value) ? "" : "This is not a valid url",
    );
  };

  const submitChange = () => {
    if (!link || !id) {
      setLinkError("Must supply a valid Link");
      return;
    }

    updatePreviewMutation.mutate(
      { id, previewImage: link },
      {
        onError: () => {
          setLinkError("Error while submitting");
        },
        onSuccess: () => {
          setLink("");
          setLinkError("");
          refresh?.();
        },
      },
    );
  };

  const isAddButtonDisabled =
    updatePreviewMutation.isPending || linkError !== "";

  return (
    <section>
      {previewImage ? (
        <div style={{ height: "auto", marginBottom: 16, maxWidth: 320 }}>
          <img
            alt="Preview"
            src={previewImage}
            style={{ height: "auto", maxWidth: "100%" }}
          />
        </div>
      ) : (
        <p style={{ margin: "0 0 16px" }}>
          Enter an imgur url to display an image for social networks
        </p>
      )}

      <InputWithButton
        buttonDisabled={isAddButtonDisabled}
        buttonLabel="Update Preview Image"
        disabled={updatePreviewMutation.isPending}
        errorText={linkError}
        onChange={handleChange}
        onClick={submitChange}
        placeholder="Preview Image"
        value={link}
      />
    </section>
  );
}
