import styled from "react-emotion"
import { ReactNode } from "react"
import { darken } from "polished"
import { colors } from "../style/colors"
import Flex from "./Flex"
import ClickTarget from "./ClickTarget"
import FlexCell from "./FlexCell"

const Radio = styled("div")`
  transition: 0.15s ease-out;
  margin-right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colors.gray};
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(.active):hover {
    background: ${darken(0.1, colors.gray)};
  }

  svg {
    transition: 0.15s ease-out;
    path {
      transition: 0.15s ease-out;
      stroke-dasharray: 25;
      stroke-dashoffset: 25;
    }
  }

  &.active {
    background: ${colors.blue};
    svg {
      path {
        stroke-dashoffset: 7;
      }
    }
  }
`

const RadioLabel = styled("p")`
  margin: 0;
  font-size: 16px;
`

interface RadioInputProps {
  children: ReactNode
  onClick: (value: string) => void
  selectedValue: string
  value: string
}

export default function RadioInput({
  children,
  onClick,
  selectedValue,
  value
}: RadioInputProps) {
  return (
    <Flex margin="0 0 16px">
      <FlexCell align="center" grow="0" basis="auto">
        <ClickTarget onClick={() => onClick(value)}>
          <Radio className={selectedValue === value ? "active" : ""} />
        </ClickTarget>
      </FlexCell>
      <FlexCell>
        <RadioLabel>{children}</RadioLabel>
      </FlexCell>
    </Flex>
  )
}
