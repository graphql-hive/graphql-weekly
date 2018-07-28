import styled from "react-emotion";

export default styled("section")`
  flex: ${p => p.grow || 1} 0 ${p => p.basis || "0px"};
  margin: ${p => p.margin || 0};
`;
