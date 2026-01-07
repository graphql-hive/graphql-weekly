import { ChangeEventHandler, CSSProperties, MouseEventHandler, ReactNode } from "react"
import Input from "./Input"
import Flex from "./Flex"
import { Button } from "./Button"
import ErrorText from "./ErrorText"

interface InputWithButtonProps {
  buttonLabel: ReactNode
  buttonDisabled?: boolean
  disabled?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onClick?: MouseEventHandler<HTMLButtonElement>
  style?: CSSProperties
  type?: string
  placeholder?: string
  errorText?: ReactNode
  value?: string
}

export default function InputWithButton({
  buttonLabel,
  buttonDisabled,
  disabled,
  onChange,
  onClick,
  style,
  type,
  placeholder,
  errorText,
  value
}: InputWithButtonProps) {
  return (
    <>
      <Flex>
        <Input
          type={type}
          style={style}
          value={value}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
        />
        <Button disabled={buttonDisabled} onClick={onClick} margin="0 0 0 10px">
          {buttonLabel}
        </Button>
      </Flex>
      {errorText && <ErrorText>{errorText}</ErrorText>}
    </>
  )
}
