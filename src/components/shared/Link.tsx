import * as React from 'react'

// Local
import { UnstyledButton } from './general'

type Props = {
  /** For local routes/links */
  to?: string
  /** For external links with e.g. https://google.com */
  children?: any
  href?: string

  // other
  className?: string
  onClick?: any
  onMouseEnter?: any
  onMouseOut?: any
  onMouseOver?: any
  rel?: string
  style?: any
  target?: string
}

export const Link = ({
  children,
  className,
  href,
  onClick,
  onMouseEnter,
  onMouseOut,
  onMouseOver,
  rel,
  style,
  target,
  to,
}: Props) => {
  const rest = {
    className,
    onClick,
    onMouseEnter,
    onMouseOut,
    onMouseOver,
    rel,
    style,
    target,
  }

  // For local routes (to), convert to href
  const linkHref = to || href
  const Wrapper = linkHref ? 'a' : UnstyledButton
  const props = linkHref ? { href: linkHref, ...rest } : { ...rest }

  return <Wrapper {...props}>{children}</Wrapper>
}
