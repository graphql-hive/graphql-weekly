import { ReactNode, useId } from "react";

import Flex from "./Flex";
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
  const id = useId();

  return (
    <Flex margin="0 0 16px">
      <FlexCell align="center" basis="auto" grow="0">
        <label htmlFor={id} className="cursor-pointer flex items-center">
          <input
            type="radio"
            id={id}
            checked={isActive}
            onChange={() => onClick(value)}
            className="sr-only peer"
          />
          <div
            className={`
              transition-all duration-150 ease-out mr-3 w-6 h-6
              flex items-center justify-center border-2
              peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
              ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-neu-200 border-neu-300 hover:bg-neu-300 dark:bg-neu-700 dark:border-neu-600 dark:hover:bg-neu-600"
              }
            `}
          >
            {isActive && (
              <svg className="w-4 h-4 text-neu-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M5 13l4 4L19 7" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            )}
          </div>
        </label>
      </FlexCell>
      <FlexCell>
        <label htmlFor={id} className="m-0 text-base cursor-pointer dark:text-neu-100">
          {children}
        </label>
      </FlexCell>
    </Flex>
  );
}
