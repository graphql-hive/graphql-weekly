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
  buttonLabel: ReactNode;
  buttonDisabled?: boolean;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  type?: string;
  placeholder?: string;
  errorText?: ReactNode;
  value?: string;
  inputRef?: RefObject<HTMLInputElement | null> | undefined;
  label?: string;
}

// TODO: This component shouldn't exist.
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
  value,
  inputRef,
  label,
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
            ref={inputRef}
            type={type}
            style={style}
            value={value}
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-right dark:text-neu-100 placeholder:text-neu-400 dark:placeholder:text-neu-600"
          />
        </label>
        <Button
          disabled={buttonDisabled}
          onClick={onClick}
          className="shrink-0"
        >
          {buttonLabel}
        </Button>
      </div>
      {errorText && <ErrorText>{errorText}</ErrorText>}
    </>
  );
}
