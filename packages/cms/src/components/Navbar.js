import React from "react";
import styled from "react-emotion";
import Logo from "./Logo";

const Wrapper = styled("div")`
  display: flex;
  align-items: center;
  pointer-events: ${p => (p.disabled ? "none" : "all")};
  opacity: ${p => (p.disabled ? 0.8 : 1)};
`;

const StyledTopbar = styled("div")`
  position: relative;
  z-index: 10;
  background: white;
  box-shadow: 0px 3px 3px rgba(12, 52, 75, 0.05);
  width: 100vw;
  display: flex;
  height: 56px;
  flex: 0 0 56px;
  justify-content: space-between;
`;

const Brand = styled("h1")`
  margin: 0px 10px;
  color: #3d556b;
  font-size: 24px;
  line-height: 32px;
`;

export default function Navbar() {
  return (
    <StyledTopbar>
      <Wrapper>
        <Logo />
        <Brand>qlator</Brand>
      </Wrapper>
    </StyledTopbar>
  );
}
