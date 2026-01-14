import { ChangeEventHandler, MouseEventHandler } from "react";

import { Button } from "../components/Button";
import Input from "../components/Input";
import InputWithButton from "../components/InputWithButton";
import Label from "../components/Label";
import TextArea from "../components/TextArea";

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

export default function EditSheet({
  description,
  handlers,
  hasChanged,
  hasDelete,
  link,
  linkError,
  title,
}: EditSheetProps) {
  return (
    <>
      <Label>Title</Label>
      <Input
        onChange={handlers.handleTitleChange}
        placeholder="Title"
        style={{ marginBottom: 16, width: "90%" }}
        value={title}
      />
      <Label>Description</Label>
      <TextArea
        onChange={handlers.handleDescChange}
        placeholder={`Description for ${title}`}
        style={{ height: 90, marginBottom: 16, width: "90%" }}
        value={description}
      />
      <Label>Link</Label>
      <InputWithButton
        buttonLabel="Go"
        errorText={linkError}
        onChange={handlers.handleLinkChange}
        onClick={() => window.open(link)}
        placeholder="Link"
        style={{ width: "70%" }}
        value={link}
      />

      {hasChanged && (
        <section style={{ marginTop: "16px" }}>
          <Button onClick={handlers.onSave} style={{ width: "100%" }}>
            Save Changes
          </Button>
        </section>
      )}
      {hasDelete && (
        <section style={{ marginTop: "16px" }}>
          <Button block onClick={handlers.onDelete} variant="danger">
            Delete
          </Button>
        </section>
      )}
    </>
  );
}
