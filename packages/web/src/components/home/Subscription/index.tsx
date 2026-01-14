import type { FormEvent } from "react";

import { Component } from "react";

import { PrimaryButton } from "../../shared/Buttons/Index";
import { Input } from "../../shared/Input/Input";
import { AlertCircle } from "../../vectors/AlertCircle";
import { Check } from "../../vectors/Check";
import { Subscribe } from "../../vectors/Subscribe";

type Props = {};
type State = { email: string; loading: boolean; message: string; name: string };

export class Subscription extends Component<Props, State> {
  state = {
    email: "",
    loading: false,
    message: "",
    name: "",
  };

  subscribeSubmited = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      this.state.name !== "" &&
      this.state.email !== "" &&
      this.state.loading === false
    ) {
      this.setState({ loading: true });

      const res = await subscribeUser({
        email: this.state.email,
        name: this.state.name,
      });

      if (res && res.data.createSubscriber.email === this.state.email) {
        this.showMessage("You are successfully added 🎉");
        this.setState({ email: "", loading: false, name: "" });
      } else {
        this.setState({ loading: false });
        this.showMessage("Error!");
      }
    } else {
      this.showMessage("Empty values!");
    }

    return false;
  };

  showMessage = (message: string) => {
    this.setState({ message });

    setTimeout(() => {
      this.setState({ message: "" });
    }, 5000);
  };

  render() {
    return (
      <form
        className="relative max-w-[783px] min-h-[88px] mx-auto p-6 pl-8 md:pl-8 flex items-stretch md:flex-row flex-col md:items-stretch items-stretch bg-white shadow-[0px_4px_16px_rgba(8,17,70,0.1)] rounded-large"
        onSubmit={this.subscribeSubmited}
      >
        <Input
          label="NAME"
          onChange={(e) => this.setState({ name: e.target.value })}
          placeholder="Bob Loblaw"
          value={this.state.name}
        />
        <div className="w-auto h-px my-1 md:w-px md:h-10 md:my-0 md:mx-6 bg-gray-border" />
        <Input
          label="EMAIL"
          onChange={(e) => this.setState({ email: e.target.value })}
          placeholder="bob@example.com"
          value={this.state.email}
        />
        <div className="shrink-0 h-5 md:h-0" />
        <PrimaryButton
          disabled={this.state.loading}
          icon={<Subscribe />}
          text="Subscribe"
          type="submit"
        />

        {this.state.message && (
          <div
            className="absolute px-[10px] py-[5px] right-[25px] bottom-[-15px] bg-body-bg rounded-sm text-[#424242] text-sm flex items-center gap-1.5"
            role="status"
          >
            {this.state.message.includes("successfully") ? (
              <Check
                aria-hidden="true"
                className="shrink-0 [&_path]:stroke-green-600 [&_path]:opacity-100"
              />
            ) : (
              <AlertCircle aria-hidden="true" className="shrink-0" />
            )}
            {this.state.message}
          </div>
        )}
      </form>
    );
  }
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

  return fetch(
    "https://graphqlweekly-api.netlify.app/.netlify/functions/graphql",
    {
      body: JSON.stringify({ operationName, query, variables }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).then((res) => res.json());
};
