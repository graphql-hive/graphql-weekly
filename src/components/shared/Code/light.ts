import duotoneLight from "react-syntax-highlighter/dist/esm/styles/prism/duotone-light";
export const light = {
  ...duotoneLight,

  'code[class*="language-"]': {
    background: "none",
    color: "#24DA8D",
    direction: "ltr",
    fontFamily:
      'Roboto Mono, Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: "14px",
    hyphens: "none",
    lineHeight: "1.574",
    MozHyphens: "none",
    MozTabSize: "2",
    msHyphens: "none",
    OTabSize: "2",
    tabSize: "2",
    textAlign: "left",
    WebkitHyphens: "none",
    whiteSpace: "pre",
    wordBreak: "normal",
    wordSpacing: "normal",
  },
};
