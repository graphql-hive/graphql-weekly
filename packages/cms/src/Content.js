import React, { Component } from "react";
import IconButton from "material-ui/IconButton";
import FontIcon from "material-ui/FontIcon";
import NavigationExpandMoreIcon from "material-ui/svg-icons/navigation/expand-more";
import { Card, CardText } from "material-ui/Card";
import TopicDialog from "./TopicDialog";

export default class Content extends Component {
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

  showTopics = () => {
    this.setState({
      open: true
    });
  };

  render() {
    return (
      <Card
        expanded={this.state.expanded}
        onExpandChange={this.handleExpandChange}
      >
        <TopicDialog
          open={this.state.open}
          topics={this.props.topics}
          linkId={this.props.linkId}
          handleClose={() => {
            this.setState({ open: false });
          }}
          refresh={this.props.refresh}
        />
      </Card>
    );
  }
}
