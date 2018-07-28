import React from "react";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import urlRegex from "url-regex";
import { browserHistory } from "react-router";
import { client } from "./index";
import Navbar from "./components/Navbar";
import Card from "./components/Card";

export default class LinkAdder extends React.Component {
  constructor(props) {
    super(props);

    client
      .query(
        `
            {
              allIssues{
                id
                title
                published
              }
            }
        `
      )
      .then(result => {
        this.setState({
          issues: result.allIssues
        });
      });

    this.state = {
      link: "",
      loading: false,
      linkError: "",
      number: "",
      issues: []
    };
  }

  handleChange = e => {
    this.setState({
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
    client
      .mutate(
        `{ addLink:
        createLink(url:"${this.state.link}"){id}

    }`
      )
      .then(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: ""
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: "Error while submitting"
        });
      });
  };

  handleNumberChange = e => {
    this.setState({
      number: e.target.value
    });
  };

  submitIssueChange = e => {
    this.setState({
      loading: true
    });
    client
      .mutate(
        `
        {
          createIssue(title: "Issue ${this.state.number}", number: ${
          this.state.number
        }, date:"${new Date().toISOString()}", published: false){id}
        }
        `
      )
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

  renderIssues() {
    return this.state.issues.map(issue => {
      return (
        <FlatButton
          key={issue.id}
          label={issue.title}
          disabled={issue.published}
          onTouchTap={() => {
            browserHistory.push("/issue/" + issue.id);
          }}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <Navbar />

        <Card>
          <TextField
            disabled={this.state.loading}
            floatingLabelText={"Link"}
            onChange={this.handleChange}
            value={this.state.link}
            errorText={this.state.linkError}
          />
          <FlatButton
            disabled={this.state.loading || this.state.linkError !== ""}
            label={"Add Link"}
            onTouchTap={this.submitChange}
          />

          <TextField
            disabled={this.state.loading}
            floatingLabelText={"Issue Number"}
            onChange={this.handleNumberChange}
          />
          <FlatButton
            disabled={this.isAddButtonDisabled()}
            label={"Add Issue"}
            onTouchTap={this.submitIssueChange}
          />
        </Card>

        <Card>{this.renderIssues()}</Card>
      </div>
    );
  }
}
