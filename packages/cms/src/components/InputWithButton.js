import React, { Fragment } from "react";
import Input from "./Input";
import Flex from "./Flex";
import { Button } from "./Button";
import ErrorText from "./ErrorText";

export default function InputWithButton({
  buttonLabel,
  buttonDisabled,
  disabled,
  onChange,
  onClick,
  style,
  placeholder,
  errorText,
  value
}) {
  return (
    <Fragment>
      <Flex>
        <Input
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
    </Fragment>
  );
}
