import styled from "react-emotion";
import { colors } from "../style/colors";

export const HeaderContainer = styled("section")`
  padding: 16px 0;
  display: flex;
`;

export const Header = styled("h1")`
  font-size: 19px;
  flex: 1 0 0px;
  align-self: center;
  line-height: 24px;
  color: ${colors.dark};
  margin: 0;
`;
