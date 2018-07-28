import React from "react";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import InputWithButton from "../components/InputWithButton";

const createIssue = gql`
  mutation create($title: String, $number: Int, $date: String, $published: Boolean) {
    createIssue(title: $title, number: $number, date: $date, published: $published) {
      id
    }
  }
`;

class IssueCreator extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      number: "",
      loading: false,
      numberError: ""
    };
  }

  handleNumberChange = e => {
    this.setState({
      loading: false,
      numberError: "",
      number: e.target.value
    });
  };

  submitIssueChange = e => {
    this.setState({
      loading: true
    });

    if (!this.state.number) {
      return this.setState({
        loading: false,
        number: "",
        numberError: "Must supply a valid Issue Number"
      });
    }

    this.props
      .mutate({
        variables: {
          title: "Issue ${this.state.number}",
          date: `${new Date().toISOString()}`,
          number: this.state.number,
          published: false
        }
      })
      .then(() => {
        location.reload();
      });
  };

  isAddButtonDisabled() {
    return (
      this.state.loading || // disabled while loading
      this.state.number === "" || // disabled for empty number
      isNaN(this.state.number)
    ); // disabled while no numerical issue number
  }

  render() {
    return (
      <InputWithButton
        disabled={this.state.loading}
        placeholder="Issue Number"
        onTouchTap={this.submitIssueChange}
        onChange={this.handleNumberChange}
        buttonLabel="Add Issue"
        buttonDisabled={this.isAddButtonDisabled()}
        errorText={this.state.numberError}
      />
    );
  }
}

export default graphql(createIssue)(IssueCreator);
