import React from "react";
import styled from "react-emotion";
import PrismaLogo from "../icons/Prisma";

const LogoWrapper = styled("a")`
  background: #0c344b;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Logo() {
  return (
    <LogoWrapper href="/">
      <PrismaLogo />
    </LogoWrapper>
  );
}
