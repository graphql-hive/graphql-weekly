import { light } from "./light";

const primaryLight1 = "#8FA6B2";
const blue = "#006FD1";
const orange = "#E86E16";
export const graphqlLight = {
  ...light,

  "attr-name": {
    color: blue,
  },

  'code[class*="language-"]': {
    color: orange,
  },
  function: {
    color: primaryLight1,
  },
  property: {
    color: primaryLight1,
  },

  punctuation: {
    color: primaryLight1,
  },
};
