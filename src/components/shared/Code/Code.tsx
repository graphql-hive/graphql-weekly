import * as React from 'react'
import { PrismLight } from 'react-syntax-highlighter'
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'

import { dark } from './dark'
import { Pre } from './Pre'

PrismLight.registerLanguage('graphql', graphql)
PrismLight.registerLanguage('json', json)

const SyntaxHighlighter = PrismLight as any

type Props = {
  background?: boolean
  children?: React.ReactNode | string
  compact?: boolean
  customStyle?: object
  language?: string
  showLineNumbers?: boolean
}

export function Code({
  background = true,
  children,
  compact,
  customStyle = {},
  language,
  showLineNumbers,
}: Props) {
  const code = typeof children === 'string' ? children.trim() : ''

  return (
    <SyntaxHighlighter
      customStyle={{
        background: 'none',
        flex: 1,
        flexGrow: 1,
        height: '100%',
        margin: 0,
        padding: background ? 16 : 0,
        width: '100%',
        ...customStyle,
      }}
      language={language}
      lineNumberContainerStyle={{
        color: '#8FA6B2',
        float: 'left',
        opacity: 0.5,
        paddingRight: 20,
        textAlign: 'right',
      }}
      PreTag={(props: React.HTMLAttributes<HTMLPreElement>) => (
        <Pre {...props} background={background} compact={compact} />
      )}
      showLineNumbers={showLineNumbers}
      style={dark as any}
    >
      {code}
    </SyntaxHighlighter>
  )
}

export default Code
