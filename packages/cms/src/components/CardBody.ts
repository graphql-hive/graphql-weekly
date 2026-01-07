import styled from "react-emotion";

interface CardBodyProps {
  padding?: string;
}

export default styled<CardBodyProps>("div")`
  padding: ${(props) => props.padding || "24px"};
`;
