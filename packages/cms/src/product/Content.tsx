import { Component, ChangeEvent } from "react";
import styled from "react-emotion";
import { graphql, compose, MutationFn } from "react-apollo";
import urlRegex from "url-regex";
import { gql } from "apollo-boost";
import { OpenPanel } from "../components/Panels";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";
import ClickTarget from "../components/ClickTarget";
import LinkIcon from "../icons/Link";
import { ArrowDownIcon, ArrowUpIcon } from "../icons/Arrow";
import { colors } from "../style/colors";
import EditSheet from "./EditSheet";
import TopicDialog from "./TopicDialog";

const Row = styled("div")`
  padding: 16px;
  border-bottom: 1px solid ${colors.gray};
`;

const updateMutation = gql`
  mutation update(
    $id: String!
    $title: String!
    $text: String!
    $url: String!
  ) {
    updateLink(id: $id, title: $title, text: $text, url: $url) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation delete($id: String!) {
    deleteLink(id: $id) {
      id
    }
  }
`;

interface Link {
  id: string;
  title: string;
  text: string;
  url: string;
  topic: { id: string; position: number } | null;
}

interface Topic {
  id: string;
  title: string;
  position: number;
}

interface ContentProps {
  link: Link;
  topics: Topic[];
  linkId: string;
  refresh: () => void;
  hasDelete?: boolean;
  updateLink: MutationFn;
  deleteLink: MutationFn;
}

interface ContentState {
  title: string;
  description: string;
  link: string;
  linkError: string;
  hasChanged: boolean;
  expanded: boolean;
}

class Content extends Component<ContentProps, ContentState> {
  constructor(props: ContentProps) {
    super(props);
    this.state = {
      title: props.link.title,
      description: props.link.text,
      link: props.link.url,
      linkError: "",
      hasChanged: false,
      expanded: false,
    };
  }

  expandContent = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ description: e.target.value, hasChanged: true });
  };

  handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: e.target.value, hasChanged: true });
  };

  handleLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      link: e.target.value,
      linkError: urlRegex({ exact: true }).test(e.target.value)
        ? ""
        : "This is not a valid url",
      hasChanged: true,
    });
  };

  onSave = () => {
    return this.props
      .updateLink({
        variables: {
          id: this.props.link.id,
          title: this.state.title,
          text: this.state.description,
          url: this.state.link,
        },
      })
      .then(() => {
        this.props.refresh();
        this.setState({ expanded: false });
      });
  };

  onDelete = () => {
    return this.props
      .deleteLink({
        variables: { id: this.props.link.id },
      })
      .then(() => {
        this.props.refresh();
        this.setState({ expanded: false });
      });
  };

  override render() {
    const { expanded, title, link, linkError, hasChanged, description } =
      this.state;
    const { hasDelete } = this.props;

    return (
      <Row>
        <Flex
          style={{
            paddingBottom: expanded ? 16 : 0,
            borderBottom: expanded ? `1px solid ${colors.gray}` : "none",
          }}
        >
          <FlexCell align="center">{title}</FlexCell>
          <FlexCell basis="auto" grow="0" margin="0 10px 0" align="center">
            <OpenPanel>
              {({ showPanel }) => (
                <ClickTarget
                  onClick={() => showPanel(TopicDialog as any, this.props)}
                >
                  <LinkIcon />
                </ClickTarget>
              )}
            </OpenPanel>
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
              hasDelete={hasDelete}
              title={title}
              link={link}
              linkError={linkError}
              hasChanged={hasChanged}
              description={description}
              handlers={{
                handleTitleChange: this.handleTitleChange,
                handleDescChange: this.handleDescChange,
                handleLinkChange: this.handleLinkChange,
                onSave: this.onSave,
                onDelete: this.onDelete,
              }}
            />
          </section>
        )}
      </Row>
    );
  }
}

export default compose(
  graphql(deleteMutation, { name: "deleteLink" }),
  graphql(updateMutation, { name: "updateLink" }),
)(Content);
