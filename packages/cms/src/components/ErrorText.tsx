import { ReactNode } from "react";
import RedCross from "../icons/RedCross";
import Flex from "./Flex";

interface ErrorTextProps {
  children: ReactNode;
}

export default function ErrorText({ children }: ErrorTextProps) {
  return (
    <Flex margin="10px 0 0">
      <RedCross />
      <div className="text-xs leading-[15px] text-[#FF4F56] ml-2.5 self-center">
        {children}
      </div>
    </Flex>
  );
}
