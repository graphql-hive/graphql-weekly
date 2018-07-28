import React from "react";
import styled from "react-emotion";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";
import { colors } from "../style/colors";

const Row = styled("div")`
  padding: 16px;
  border-bottom: 1px solid ${colors.gray};
`;

export default class Content extends React.Component {
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

  render() {
    return (
      <Row>
        <Flex>
          <FlexCell>{this.state.title}</FlexCell>
          <FlexCell basis="auto" grow="0">
            ▾
          </FlexCell>
        </Flex>
      </Row>
    );
  }
}
