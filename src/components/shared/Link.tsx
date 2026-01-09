import type { CSSProperties, MouseEvent, ReactNode } from 'react'

// Local
import { UnstyledButton } from './general'

type Props = {
  /** For local routes/links */
  to?: string
  /** For external links with e.g. https://google.com */
  children?: ReactNode
  href?: string

  // other
  className?: string
  onClick?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  onMouseOut?: (e: MouseEvent) => void
  onMouseOver?: (e: MouseEvent) => void
  rel?: string
  style?: CSSProperties
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
