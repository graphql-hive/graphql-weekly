import React, { Fragment } from "react";
import { Button } from "../components/Button";
import InputWithButton from "../components/InputWithButton";
import Label from "../components/Label";
import Input from "../components/Input";
import TextArea from "../components/TextArea";

export default class EditSheet extends React.Component {
  render() {
    const {
      hasChanged,
      description,
      linkError,
      link,
      title,
      handlers,
      hasDelete
    } = this.props;

    return (
      <Fragment>
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
          onClick={() => {
            return window.open(link);
          }}
        />

        {hasChanged && (
          <section
            style={{
              marginTop: "16px"
            }}
          >
            <Button style={{ width: "100%" }} onClick={handlers.onSave}>
              Save Changes
            </Button>
          </section>
        )}
        {hasDelete && (
          <section
            style={{
              marginTop: "16px"
            }}
          >
            <Button
              style={{ width: "100%" }}
              color="red"
              onClick={handlers.onDelete}
            >
              Delete
            </Button>
          </section>
        )}
      </Fragment>
    );
  }
}
