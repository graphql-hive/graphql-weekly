import { ReactNode } from "react";
import Flex from "./Flex";
import ClickTarget from "./ClickTarget";
import FlexCell from "./FlexCell";

interface RadioInputProps {
  children: ReactNode;
  onClick: (value: string) => void;
  selectedValue: string;
  value: string;
}

export default function RadioInput({
  children,
  onClick,
  selectedValue,
  value,
}: RadioInputProps) {
  const isActive = selectedValue === value;

  return (
    <Flex margin="0 0 16px">
      <FlexCell align="center" grow="0" basis="auto">
        <ClickTarget onClick={() => onClick(value)}>
          <div
            className={`
              transition-all duration-150 ease-out mr-3 w-6 h-6 rounded-full
              flex items-center justify-center
              [&_svg]:transition-all [&_svg]:duration-150 [&_svg]:ease-out
              [&_svg_path]:transition-all [&_svg_path]:duration-150 [&_svg_path]:ease-out
              [&_svg_path]:[stroke-dasharray:25] [&_svg_path]:[stroke-dashoffset:25]
              ${
                isActive
                  ? "bg-[#0F7AD8] [&_svg_path]:[stroke-dashoffset:7]"
                  : "bg-[#CCD9DF] hover:bg-[#a8bcc8]"
              }
            `}
          />
        </ClickTarget>
      </FlexCell>
      <FlexCell>
        <p className="m-0 text-base">{children}</p>
      </FlexCell>
    </Flex>
  );
}
