import { useRef, useState } from "react";

import { MUTATION_ENDPOINT } from "../../../lib/api";
import { PrimaryButton } from "../../shared/Buttons/Index";
import { Input } from "../../shared/Input/Input";
import { AlertCircle } from "../../vectors/AlertCircle";
import { Check } from "../../vectors/Check";
import { Subscribe } from "../../vectors/Subscribe";

export function Subscription() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
      showMessage("Empty values!");
      return;
    }

    setLoading(true);

    try {
      const res = await subscribeUser({ email, name });

      if (res?.data?.createSubscriber?.email === email) {
        showMessage("You are successfully added 🎉");
        formRef.current?.reset();
      } else {
        showMessage("Error!");
      }
    } catch {
      showMessage("Error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="relative max-w-[783px] min-h-[88px] mx-auto p-6 pl-8 md:pl-8 flex items-stretch md:flex-row flex-col md:items-stretch items-stretch bg-white shadow-[0px_4px_16px_rgba(8,17,70,0.1)] rounded-large"
      onSubmit={handleSubmit}
    >
      <Input label="NAME" name="name" placeholder="Bob Loblaw" />
      <div className="w-auto h-px my-1 md:w-px md:h-10 md:my-0 md:mx-6 bg-gray-border" />
      <Input label="EMAIL" name="email" placeholder="bob@example.com" />
      <div className="shrink-0 h-5 md:h-0" />
      <PrimaryButton
        disabled={loading}
        icon={<Subscribe />}
        text="Subscribe"
        type="submit"
      />

      {message && (
        <output className="absolute px-[10px] py-[5px] right-[25px] bottom-[-15px] bg-body-bg rounded-sm text-[#424242] text-sm flex items-center gap-1.5">
          {message.includes("successfully") ? (
            <Check
              aria-hidden="true"
              className="shrink-0 [&_path]:stroke-green-600 [&_path]:opacity-100"
            />
          ) : (
            <AlertCircle aria-hidden="true" className="shrink-0" />
          )}
          {message}
        </output>
      )}
    </form>
  );
}

const subscribeUser = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  const query = `
    mutation createSubscriber($name: String!,$email: String! ){
      createSubscriber(name: $name,email: $email) {
        email
        name
      }
    }
  `;
  const variables = { email, name };
  const operationName = "createSubscriber";

  return fetch(MUTATION_ENDPOINT, {
    body: JSON.stringify({ operationName, query, variables }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).then((res) => res.json());
};
