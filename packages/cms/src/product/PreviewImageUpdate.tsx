import { useState, ChangeEvent } from "react";
import InputWithButton from "../components/InputWithButton";
import { useUpdateIssuePreviewImageMutation } from "../generated/graphql";

interface PreviewImageUpdateProps {
  previewImage?: string | null;
  id?: string | null;
  refresh?: () => void;
}

export default function PreviewImageUpdate({
  previewImage,
  id,
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
        onSuccess: () => {
          setLink("");
          setLinkError("");
          refresh?.();
        },
        onError: () => {
          setLinkError("Error while submitting");
        },
      },
    );
  };

  const isAddButtonDisabled =
    updatePreviewMutation.isPending || linkError !== "";

  return (
    <section>
      {previewImage ? (
        <div style={{ maxWidth: 320, height: "auto", marginBottom: 16 }}>
          <img
            style={{ maxWidth: "100%", height: "auto" }}
            src={previewImage}
            alt="Preview"
          />
        </div>
      ) : (
        <p style={{ margin: "0 0 16px" }}>
          Enter an imgur url to display an image for social networks
        </p>
      )}

      <InputWithButton
        value={link}
        disabled={updatePreviewMutation.isPending}
        placeholder="Preview Image"
        onClick={submitChange}
        onChange={handleChange}
        buttonLabel="Update Preview Image"
        buttonDisabled={isAddButtonDisabled}
        errorText={linkError}
      />
    </section>
  );
}
