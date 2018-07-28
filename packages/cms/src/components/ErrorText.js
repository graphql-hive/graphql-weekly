import React from "react";
import styled from "react-emotion";
import RedCross from "../icons/RedCross";
import { colors } from "../style/colors";
import Flex from "./Flex";

export default function ErrorText({ children }: any) {
  return (
    <Flex margin="10px 0 0">
      <RedCross />
      <Text>{children}</Text>
    </Flex>
  );
}

const Text = styled("div")`
  font-size: 12px;
  line-height: 15px;
  color: ${colors.red};
  margin-left: 10px;
  align-self: center;
`;
