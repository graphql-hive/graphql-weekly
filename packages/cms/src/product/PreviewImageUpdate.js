import React from "react";
import urlRegex from "url-regex";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import InputWithButton from "../components/InputWithButton";

const updateIssue = gql`
  mutation update($id: ID!, $previewImage: String!) {
    updateIssue(id: $id, previewImage: $previewImage) {
      id
      previewImage
    }
  }
`;

class PreviewImageUpdate extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      link: props.previewImage || "",
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

    const previewImage = this.state.link;
    const id = this.props.id;

    return this.props
      .mutate({
        variables: {
          previewImage,
          id
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
      <section>
        {this.props.previewImage ? (
          <div style={{ maxWidth: 320, height: "auto", marginBottom: 16 }}>
            <img
              style={{ maxWidth: "100%", height: "auto" }}
              src={this.props.previewImage}
            />
          </div>
        ) : (
          <p style={{ margin: '0 0 16px' }}>
            Enter an imgur url to display a image for social networks
          </p>
        )}

        <InputWithButton
          value={this.state.link}
          disabled={this.state.loading}
          placeholder="Preview Image"
          onClick={this.submitChange}
          onChange={this.handleChange}
          buttonLabel="Update Preview Image"
          buttonDisabled={this.isAddButtonDisabled()}
          errorText={this.state.linkError}
        />
      </section>
    );
  }
}

export default graphql(updateIssue)(PreviewImageUpdate);
