import type { ReactNode } from "react";

import { PrismLight } from "react-syntax-highlighter";
import graphql from "react-syntax-highlighter/dist/esm/languages/prism/graphql";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";

import { dark } from "./dark";
import { Pre } from "./Pre";

PrismLight.registerLanguage("graphql", graphql);
PrismLight.registerLanguage("json", json);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismLight types are incompatible with our usage
const SyntaxHighlighter = PrismLight as any;

type Props = {
  background?: boolean;
  children?: ReactNode | string;
  compact?: boolean;
  customStyle?: object;
  language?: string;
  showLineNumbers?: boolean;
};

export function Code({
  background = true,
  children,
  compact,
  customStyle = {},
  language,
  showLineNumbers,
}: Props) {
  const code = typeof children === "string" ? children.trim() : "";

  return (
    <SyntaxHighlighter
      customStyle={{
        background: "none",
        flex: 1,
        flexGrow: 1,
        height: "100%",
        margin: 0,
        padding: background ? 16 : 0,
        width: "100%",
        ...customStyle,
      }}
      language={language}
      lineNumberContainerStyle={{
        color: "#8FA6B2",
        float: "left",
        opacity: 0.5,
        paddingRight: 20,
        textAlign: "right",
      }}
      PreTag={(props: React.HTMLAttributes<HTMLPreElement>) => (
        <Pre {...props} background={background} compact={compact} />
      )}
      showLineNumbers={showLineNumbers}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dark theme object structure doesn't match CSSProperties
      style={dark as any}
    >
      {code}
    </SyntaxHighlighter>
  );
}

// eslint-disable-next-line import/no-default-export -- re-exported via index.ts
export default Code;
