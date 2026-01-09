import React from 'react'

type InputColor = string

export const Pre: React.FC<{
  background?: boolean
  children?: React.ReactNode
  className?: string
  compact?: boolean
  textColor?: InputColor
}> = ({
  background,
  children,
  className = '',
  compact,
  textColor,
  ...props
}) => {
  const baseClasses = 'm-0 grow h-full w-full flex-1'
  const paddingClasses = background ? 'p-4' : 'p-0'
  const borderClasses = 'rounded-md'
  const scrollClasses = 'scrollbar-hide'
  const fontClasses = 'font-mono text-base'
  const lineHeightClasses = compact ? 'leading-tight' : 'leading-relaxed'
  const textClasses = 'text-left whitespace-pre break-normal'

  const combinedClasses =
    `${baseClasses} ${paddingClasses} ${borderClasses} ${scrollClasses} ${fontClasses} ${lineHeightClasses} ${textClasses} ${className}`.trim()

  const styles: React.CSSProperties = {
    color: textColor || 'inherit',
    direction: 'ltr',
    fontFamily: `'Roboto Mono', Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console', 'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono', 'Nimbus Mono L', 'Courier New', Courier, monospace`,
    fontSize: '16px',
    lineHeight: compact ? 1.429 : 1.574,
    wordBreak: 'normal',
    wordSpacing: 'normal',
  }

  return (
    <pre
      className={combinedClasses}
      style={styles}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </pre>
  )
}
