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
  language?: string
  showLineNumbers?: boolean
  background?: boolean
  customStyle?: Object
  compact?: boolean
  children?: string | React.ReactNode
}

export function Code({
  language,
  children,
  compact,
  background = true,
  customStyle = {},
  showLineNumbers,
}: Props) {
  const code = typeof children === 'string' ? children.trim() : ''

  return (
    <SyntaxHighlighter
      language={language}
      style={dark as any}
      showLineNumbers={showLineNumbers}
      lineNumberContainerStyle={{
        paddingRight: 20,
        opacity: 0.5,
        textAlign: 'right',
        color: '#8FA6B2',
        float: 'left',
      }}
      customStyle={{
        margin: 0,
        padding: background ? 16 : 0,
        background: 'none',
        flexGrow: 1,
        height: '100%',
        width: '100%',
        flex: 1,
        ...customStyle,
      }}
      PreTag={(props: React.HTMLAttributes<HTMLPreElement>) => (
        <Pre {...props} compact={compact} background={background} />
      )}
    >
      {code}
    </SyntaxHighlighter>
  )
}

export default Code
