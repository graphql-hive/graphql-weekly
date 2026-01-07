import styled from "react-emotion";
import { colors } from "../style/colors";

export default styled("input")`
  padding: 13px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-style: normal;
  border: 1px solid ${colors.gray};
  display: block;
  transition: 0.1s linear all;
  outline: none;

  &:disabled {
    font-style: italic;
    background-color: ${colors.gray};
  }

  &::placeholder {
    color: rgba(61, 85, 107, 0.6);
  }

  &:not([type="checkbox"]):focus {
    border-color: transparent;
    box-shadow: inset 0 0 0 2px ${colors.blue};
  }
`;
