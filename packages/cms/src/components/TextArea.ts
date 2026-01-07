import styled from "react-emotion";

export default styled("textarea")`
  padding: 13px 16px;
  border-radius: 3px;
  font-size: 14px;
  border: 1px solid #d9e3ed;
  display: block;
  transition: 0.1s linear all;
  outline: none;
  &::placeholder {
    color: rgba(61, 85, 107, 0.4);
  }
  &:focus {
    border-color: #1f8ceb;
    box-shadow: 0 0 2px #1f8ceb;
  }
  &:disabled {
    font-style: italic;
  }
`;
