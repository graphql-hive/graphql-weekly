import styled from "react-emotion";
import X from "./X";

export default function RedCross() {
  return (
    <Wrapper>
      <X />
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  width: 20px;
  height: 20px;
  background: #ff4f56;
  border-radius: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
`;
