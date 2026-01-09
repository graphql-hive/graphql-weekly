import * as React from 'react'

// Local
import { UnstyledButton } from './general'

type Props = {
  /** For local routes/links */
  to?: string
  /** For external links with e.g. https://google.com */
  href?: string
  children?: any

  // other
  target?: string
  rel?: string
  className?: string
  style?: any
  onClick?: any
  onMouseOver?: any
  onMouseEnter?: any
  onMouseOut?: any
}

export const Link = ({
  to,
  href,
  children,
  target,
  rel,
  className,
  style,
  onClick,
  onMouseOver,
  onMouseEnter,
  onMouseOut,
}: Props) => {
  const rest = {
    target,
    rel,
    className,
    style,
    onClick,
    onMouseOver,
    onMouseEnter,
    onMouseOut,
  }

  // For local routes (to), convert to href
  const linkHref = to || href
  const Wrapper = linkHref ? 'a' : UnstyledButton
  const props = linkHref ? { href: linkHref, ...rest } : { ...rest }

  return <Wrapper {...props}>{children}</Wrapper>
}
