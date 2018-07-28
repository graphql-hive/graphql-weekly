import styled from "react-emotion";

export default styled("section")`
  display: flex;
  flex-direction: ${p => p.direction || "row"};
  margin: ${p => p.margin || 0};
  justify-content: ${p => p.align || "flex-start"};
`;
