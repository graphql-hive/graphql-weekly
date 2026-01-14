import {
  ChangeEventHandler,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  RefObject,
} from "react";

import { Button } from "./Button";
import ErrorText from "./ErrorText";

interface InputWithButtonProps {
  buttonDisabled?: boolean;
  buttonLabel: ReactNode;
  disabled?: boolean;
  errorText?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null> | undefined;
  label?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  placeholder?: string;
  style?: CSSProperties;
  type?: string;
  value?: string;
}

// TODO: This component shouldn't exist.
export default function InputWithButton({
  buttonDisabled,
  buttonLabel,
  disabled,
  errorText,
  inputRef,
  label,
  onChange,
  onClick,
  placeholder,
  style,
  type,
  value,
}: InputWithButtonProps) {
  return (
    <>
      <div className="flex items-stretch gap-2.5">
        <label
          className={`
            flex items-center flex-1 min-w-0
            px-4 py-3 text-sm border border-neu-300
            focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]
            dark:bg-neu-800 dark:border-neu-700
            ${disabled ? "italic bg-neu-200" : ""}
          `}
        >
          {label && (
            <span className="text-neu-400 dark:text-neu-500 shrink-0">
              {label}
            </span>
          )}
          <input
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-right dark:text-neu-100 placeholder:text-neu-400 dark:placeholder:text-neu-600"
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            ref={inputRef}
            style={style}
            type={type}
            value={value}
          />
        </label>
        <Button
          {...(buttonDisabled === undefined
            ? {}
            : { disabled: buttonDisabled })}
          {...(onClick === undefined ? {} : { onClick })}
          className="shrink-0"
        >
          {buttonLabel}
        </Button>
      </div>
      {errorText && <ErrorText>{errorText}</ErrorText>}
    </>
  );
}
