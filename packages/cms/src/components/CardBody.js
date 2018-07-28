import styled from "react-emotion";

export default styled("div")`
  padding: ${props => {
    return props.padding || "24px";
  }};
`;
