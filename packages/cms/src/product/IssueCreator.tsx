import React, { PureComponent, ChangeEvent, MouseEvent } from "react";
import { gql } from "apollo-boost";
import { graphql, MutationFn } from "react-apollo";
import InputWithButton from "../components/InputWithButton";

const createIssue = gql`
  mutation create(
    $title: String!
    $number: Int!
    $date: DateTime!
    $published: Boolean!
  ) {
    createIssue(
      title: $title
      number: $number
      date: $date
      published: $published
    ) {
      id
    }
  }
`;

interface IssueCreatorProps {
  mutate?: MutationFn;
  refresh?: () => void;
}

interface IssueCreatorState {
  number: string;
  loading: boolean;
  numberError: string;
}

class IssueCreator extends PureComponent<IssueCreatorProps, IssueCreatorState> {
  override state: IssueCreatorState = {
    number: "",
    loading: false,
    numberError: "",
  };

  handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      loading: false,
      numberError: "",
      number: e.target.value,
    });
  };

  submitIssueChange = (_e: MouseEvent<HTMLButtonElement>) => {
    this.setState({ loading: true });

    if (!this.state.number) {
      this.setState({
        loading: false,
        number: "",
        numberError: "Must supply a valid Issue Number",
      });
      return;
    }

    this.props
      .mutate?.({
        variables: {
          title: `Issue ${this.state.number}`,
          date: `${new Date().toISOString()}`,
          number: parseInt(this.state.number, 10),
          published: false,
        },
      })
      .then(() => {
        this.props.refresh?.();
        this.setState({
          loading: false,
          number: "",
          numberError: "",
        });
      })
      .catch((e: Error) => {
        this.setState({
          loading: false,
          numberError: e.message,
        });
      });
  };

  isAddButtonDisabled() {
    return (
      this.state.loading ||
      this.state.number === "" ||
      isNaN(Number(this.state.number))
    );
  }

  override render() {
    return (
      <InputWithButton
        disabled={this.state.loading}
        placeholder="Issue Number"
        onClick={this.submitIssueChange}
        onChange={this.handleNumberChange}
        buttonLabel="Add Issue"
        buttonDisabled={this.isAddButtonDisabled()}
        errorText={this.state.numberError}
        value={this.state.number}
      />
    );
  }
}

export default graphql(createIssue)(
  IssueCreator as any,
) as React.ComponentType<{ refresh?: () => void }>;
