import styled from "react-emotion";

interface FlexCellProps {
  grow?: string | number;
  basis?: string;
  margin?: string;
  align?: string;
}

export default styled<FlexCellProps>("section")`
  flex: ${(p) => p.grow ?? 1} 0 ${(p) => p.basis || "0px"};
  margin: ${(p) => p.margin || 0};
  align-self: ${(p) => p.align || "flex-start"};
`;
