import duotoneDark from 'react-syntax-highlighter/dist/esm/styles/prism/duotone-dark'

export const dark = {
  ...duotoneDark,

  'attr-value': {
    color: '#89DB94',
  },
  'code[class*="language-"]': {
    background: 'none',
    color: '#89DB94',
    direction: 'ltr',
    fontFamily:
      'Roboto Mono, Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: '16px',
    hyphens: 'none',
    lineHeight: '1.574',
    MozHyphens: 'none',
    MozTabSize: '2',
    msHyphens: 'none',
    OTabSize: '2',
    tabSize: '2',
    textAlign: 'left',
    WebkitHyphens: 'none',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    wordSpacing: 'normal',
  },
  comment: {
    color: '#8FA6B2',
  },
  constant: {
    color: '#89DB94',
  },
  entity: {
    color: '#6FBCFF',
  },
  function: {
    color: '#6FBCFF',
  },
  keyword: {
    color: '#FF92F0',
  },
  object: {
    color: '#89DB94',
  },
  operator: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  prolog: {
    color: '#fff',
  },
  property: {
    color: '#89DB94',
  },
  punctuation: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  string: {
    color: '#FFE376',
  },
  tag: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  variable: {
    color: '#89DB94',
  },

  // User defined types
  typedef: {
    color: '#FFB054',
  },
}
