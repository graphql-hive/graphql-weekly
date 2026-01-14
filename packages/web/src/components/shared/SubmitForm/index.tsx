import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { AlertCircle } from "../../vectors/AlertCircle";
import { Check } from "../../vectors/Check";
import { PrimaryButton, SecondaryButton } from "../Buttons/Index";
import { Input } from "../Input/Input";
import { Textarea } from "../Textarea";
import "./submit-dialog.css";

export interface SubmitFormHandle {
  showModal: () => void;
}

export const SubmitForm = forwardRef<SubmitFormHandle>(
  function SubmitForm(_, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    useImperativeHandle(ref, () => ({
      showModal: () => dialogRef.current?.showModal(),
    }));

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        dialogRef.current?.close();
      }
    };

    const showMessageTemporarily = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(""), 5500);
    };

    const formSubmitted = async (e: React.FormEvent) => {
      e.preventDefault();

      if (description && name && email && title && url && !loading) {
        setLoading(true);

        const res = await linkSubmission({
          description,
          email,
          name,
          title,
          url,
        });

        if (res?.data?.createLinkSubmission?.title === title) {
          setIsDone(true);
          setTitle("");
          setUrl("");
          setName("");
          setEmail("");
          setDescription("");
          setLoading(false);
        } else {
          setLoading(false);
          showMessageTemporarily("Error!");
        }
      } else {
        showMessageTemporarily("Empty values!");
      }
    };

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Backdrop click to close dialog is standard UX pattern
      <dialog
        className="submit-dialog p-0 bg-transparent m-auto  md:max-w-[600px] w-full"
        onClick={handleBackdropClick}
        ref={dialogRef}
      >
        <div className="min-h-[200px] box-border pb-10 bg-white border-l-8 border-gray-border shadow-[0px_4px_16px_rgba(8,17,70,0.5)] rounded-lg w-full [@media(max-height:700px)]:h-full">
          <form className="flex flex-col h-full" onSubmit={formSubmitted}>
            {isDone ? (
              <div className="max-h-full overflow-auto flex-auto shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-footer-dark">
                  Submitted for review
                </h2>
              </div>
            ) : (
              <div className="max-h-full overflow-auto flex-auto shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-footer-dark">
                  Submit a new link to the <br />
                  GraphQL Weekly newsletter!
                </h2>
                <div className="h-12 shrink-0" />

                <Input
                  label="Title"
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Title of The Link"
                  value={title}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-gray-border" />
                <Input
                  label="URL"
                  name="url"
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://your-link-address"
                  value={url}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-gray-border" />
                <Input
                  label="Name"
                  name="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  value={name}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-gray-border" />
                <Input
                  label="Email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  value={email}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-gray-border" />
                <Textarea
                  label="Description"
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a small overview of what this link is about..."
                  value={description}
                />
              </div>
            )}

            {message && (
              <div
                className="p-[9px_10px] my-[15px] mx-6 md:mx-12 bg-body-bg rounded-sm text-[#424242] text-[15px] flex items-center gap-2"
                role="alert"
              >
                <AlertCircle aria-hidden="true" className="shrink-0" />
                {message}
              </div>
            )}
            {isDone ? (
              <div className="flex shrink-0 px-12 justify-center mt-10">
                <SecondaryButton onClick={() => dialogRef.current?.close()}>
                  Close
                </SecondaryButton>
              </div>
            ) : (
              <div className="flex shrink-0 px-6 md:px-12 justify-between mt-[10px]">
                <PrimaryButton
                  disabled={loading}
                  icon={<Check />}
                  text="Submit Link"
                  type="submit"
                />

                <SecondaryButton onClick={() => dialogRef.current?.close()}>
                  Cancel
                </SecondaryButton>
              </div>
            )}
          </form>
        </div>
      </dialog>
    );
  },
);

const linkSubmission = async ({
  description,
  email,
  name,
  title,
  url,
}: {
  description: string;
  email: string;
  name: string;
  title: string;
  url: string;
}) => {
  const query = `
  mutation createSubmissionLink(
    $description: String!
    $email: String!
    $name: String!
    $title: String!
    $url: String!
  ) {
    createSubmissionLink(
      description: $description,
      email: $email,
      name: $name,
      title: $title,
      url: $url
    ) {
      title
    }
  }
  `;

  const variables = { description, email, name, title, url };

  return fetch(
    "https://graphqlweekly-api.netlify.app/.netlify/functions/graphql",
    {
      body: JSON.stringify({
        operationName: "createSubmissionLink",
        query,
        variables,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).then((res) => res.json());
};
