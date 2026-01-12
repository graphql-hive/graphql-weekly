import type { ReactNode } from "react";

export const ContentWrapper = ({
  children,
  ...props
}: {
  [key: string]: unknown;
  children: ReactNode;
}) => (
  <div className="grow shrink max-w-3xl -mt-16 pt-2 w-full" {...props}>
    {children}
  </div>
);
