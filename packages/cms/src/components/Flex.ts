import styled from "react-emotion";

interface FlexProps {
  direction?: "row" | "column";
  margin?: string;
  align?: string;
}

export default styled<FlexProps>("section")`
  display: flex;
  flex-direction: ${(p) => p.direction || "row"};
  margin: ${(p) => p.margin || 0};
  justify-content: ${(p) => p.align || "flex-start"};
`;
