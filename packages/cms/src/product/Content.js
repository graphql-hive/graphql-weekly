import React from "react";
import styled from "react-emotion";
import { graphql } from "react-apollo";
import urlRegex from "url-regex";
import { gql } from "apollo-boost";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";
import ClickTarget from "../components/ClickTarget";
import LinkIcon from "../icons/Link";
import { ArrowDownIcon, ArrowUpIcon } from "../icons/Arrow";
import { colors } from "../style/colors";
import EditSheet from "./EditSheet";

const Row = styled("div")`
  padding: 16px;
  border-bottom: 1px solid ${colors.gray};
`;

const updateMutation = gql`
  mutation update($id: ID!, $title: String!, $text: String!, $url: String!) {
    updateLink(id: $id, title: $title, text: $text, url: $url) {
      id
    }
  }
`;

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.link.title,
      description: props.link.text,
      link: props.link.url,
      linkError: "",
      hasChanged: false,
      expanded: false,
      open: false
    };
  }

  expandContent = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  handleDescChange = e => {
    this.setState({
      description: e.target.value,
      hasChanged: true
    });
  };

  handleTitleChange = e => {
    this.setState({
      title: e.target.value,
      hasChanged: true
    });
  };

  handleLinkChange = e => {
    this.setState({
      link: e.target.value,
      linkError: urlRegex({ exact: true }).test(e.target.value)
        ? ""
        : "This is not a valid url",
      hasChanged: true
    });
  };

  onSave = () => {
    return this.props
      .mutate({
        variables: {
          id: this.props.link.id,
          title: this.state.title,
          text: this.state.description,
          url: this.state.link
        }
      })
      .then(() => {
        this.setState({
          expanded: false
        });
      });
  };

  render() {
    const {
      expanded,
      title,
      link,
      linkError,
      hasChanged,
      description
    } = this.state;

    return (
      <Row>
        <Flex
          style={{
            paddingBottom: expanded ? 16 : 0,
            borderBottom: expanded ? `1px solid ${colors.gray}` : "none"
          }}
        >
          <FlexCell align="center">{title}</FlexCell>
          <FlexCell basis="auto" grow="0" margin="0 10px 0" align="center">
            <ClickTarget>
              <LinkIcon />
            </ClickTarget>
          </FlexCell>
          <FlexCell basis="auto" grow="0" margin="0 0 0 10px" align="center">
            <ClickTarget onClick={this.expandContent}>
              {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </ClickTarget>
          </FlexCell>
        </Flex>
        {expanded && (
          <section style={{ marginTop: 16 }}>
            <EditSheet
              title={title}
              link={link}
              linkError={linkError}
              hasChanged={hasChanged}
              description={description}
              handlers={{
                handleTitleChange: this.handleTitleChange,
                handleDescChange: this.handleDescChange,
                handleLinkChange: this.handleLinkChange,
                onSave: this.onSave
              }}
            />
          </section>
        )}
      </Row>
    );
  }
}

export default graphql(updateMutation)(Content);
