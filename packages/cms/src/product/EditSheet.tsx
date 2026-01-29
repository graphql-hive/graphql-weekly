import { ChangeEventHandler, MouseEventHandler, useId } from "react";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { TextArea } from "../components/TextArea";

interface EditSheetHandlers {
  handleDescChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleLinkChange: ChangeEventHandler<HTMLInputElement>;
  handleTitleChange: ChangeEventHandler<HTMLInputElement>;
  onDelete: MouseEventHandler<HTMLButtonElement>;
  onSave: MouseEventHandler<HTMLButtonElement>;
}

interface EditSheetProps {
  description: string;
  handlers: EditSheetHandlers;
  hasChanged: boolean;
  hasDelete?: boolean | undefined;
  link: string;
  linkError: string;
  title: string;
}

export function EditSheet({
  description,
  handlers,
  hasChanged,
  hasDelete,
  link,
  linkError,
  title,
}: EditSheetProps) {
  const titleId = useId();
  const descId = useId();
  const linkId = useId();

  return (
    <>
      <Label htmlFor={titleId}>Title</Label>
      <Input
        id={titleId}
        onChange={handlers.handleTitleChange}
        placeholder="Title"
        style={{ marginBottom: 16, width: "90%" }}
        value={title}
      />
      <Label htmlFor={descId}>Description</Label>
      <TextArea
        id={descId}
        onChange={handlers.handleDescChange}
        placeholder={`Description for ${title}`}
        style={{ height: 90, marginBottom: 16, width: "90%" }}
        value={description}
      />
      <Label htmlFor={linkId}>Link</Label>
      <div className="flex items-center gap-2.5" style={{ width: "70%" }}>
        <Input
          error={linkError}
          id={linkId}
          onChange={handlers.handleLinkChange}
          placeholder="Link"
          value={link}
        />
        <Button onClick={() => window.open(link)}>Go</Button>
      </div>

      {hasChanged && (
        <section style={{ marginTop: "16px" }}>
          <Button onClick={handlers.onSave} style={{ width: "100%" }}>
            Save Changes
          </Button>
        </section>
      )}
      {hasDelete && (
        <section style={{ marginTop: "16px" }}>
          <Button onClick={handlers.onDelete} variant="danger">
            Delete
          </Button>
        </section>
      )}
    </>
  );
}
