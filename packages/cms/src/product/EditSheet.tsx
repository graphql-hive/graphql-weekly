import { ChangeEventHandler, MouseEventHandler } from "react";
import { Button } from "../components/Button";
import InputWithButton from "../components/InputWithButton";
import Label from "../components/Label";
import Input from "../components/Input";
import TextArea from "../components/TextArea";

interface EditSheetHandlers {
  handleTitleChange: ChangeEventHandler<HTMLInputElement>;
  handleDescChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleLinkChange: ChangeEventHandler<HTMLInputElement>;
  onSave: MouseEventHandler<HTMLButtonElement>;
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

interface EditSheetProps {
  hasChanged: boolean;
  description: string;
  linkError: string;
  link: string;
  title: string;
  handlers: EditSheetHandlers;
  hasDelete?: boolean | undefined;
}

export default function EditSheet({
  hasChanged,
  description,
  linkError,
  link,
  title,
  handlers,
  hasDelete,
}: EditSheetProps) {
  return (
    <>
      <Label>Title</Label>
      <Input
        style={{ width: "90%", marginBottom: 16 }}
        placeholder="Title"
        value={title}
        onChange={handlers.handleTitleChange}
      />
      <Label>Description</Label>
      <TextArea
        style={{ width: "90%", height: 90, marginBottom: 16 }}
        placeholder={`Description for ${title}`}
        value={description}
        onChange={handlers.handleDescChange}
      />
      <Label>Link</Label>
      <InputWithButton
        style={{ width: "70%" }}
        placeholder="Link"
        value={link}
        onChange={handlers.handleLinkChange}
        errorText={linkError}
        buttonLabel="Go"
        onClick={() => window.open(link)}
      />

      {hasChanged && (
        <section style={{ marginTop: "16px" }}>
          <Button style={{ width: "100%" }} onClick={handlers.onSave}>
            Save Changes
          </Button>
        </section>
      )}
      {hasDelete && (
        <section style={{ marginTop: "16px" }}>
          <Button block variant="danger" onClick={handlers.onDelete}>
            Delete
          </Button>
        </section>
      )}
    </>
  );
}
