import React from "react";
import urlRegex from "url-regex";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import InputWithButton from "../components/InputWithButton";

const createLink = gql`
  mutation create($url: String!) {
    createLink(url: $url) {
      id
    }
  }
`;

class LinkCreator extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      link: "",
      loading: false,
      linkError: ""
    };
  }

  handleChange = e => {
    this.setState({
      loading: false,
      link: e.target.value,
      linkError: urlRegex({ exact: true }).test(e.target.value)
        ? ""
        : "This is not a valid url"
    });
  };

  submitChange = () => {
    this.setState({
      loading: true
    });

    if (!this.state.link) {
      return this.setState({
        loading: false,
        link: "",
        linkError: "Must supply a valid Link"
      });
    }

    const url = this.state.link;

    return this.props
      .mutate({
        variables: {
          url
        }
      })
      .then(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: ""
        });

        if (this.props.refresh) {
          this.props.refresh();
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: "Error while submitting"
        });
      });
  };

  isAddButtonDisabled() {
    return this.state.loading || this.state.linkError !== "";
  }
  render() {
    return (
      <InputWithButton
        value={this.state.link}
        disabled={this.state.loading}
        placeholder="Link"
        onClick={this.submitChange}
        onChange={this.handleChange}
        buttonLabel="Add Link"
        buttonDisabled={this.isAddButtonDisabled()}
        errorText={this.state.linkError}
      />
    );
  }
}

export default graphql(createLink)(LinkCreator);
