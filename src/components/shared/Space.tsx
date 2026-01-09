import type React from 'react'
import { cn } from '../../lib/cn'

type SpaceSizes =
  | 0
  | 4
  | 8
  | 12
  | 16
  | 20
  | 24
  | 27
  | 32
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 96
  | 100
  | 116
  | 132
  | 144

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: SpaceSizes
  height?: SpaceSizes
  widthOnMobile?: SpaceSizes
  heightOnMobile?: SpaceSizes
  fillRow?: boolean
  fillColumn?: boolean
}

export function Space({
  className,
  width,
  height,
  widthOnMobile,
  heightOnMobile,
  fillRow,
  fillColumn,
  ...rest
}: SpaceProps) {
  const style: Record<string, string | undefined> = {}

  // Use CSS custom properties when mobile variants exist
  if (typeof width === 'number') {
    if (widthOnMobile !== undefined) {
      style['--width-desktop'] = `${width}px`
      style['--width-mobile'] = `${widthOnMobile}px`
    } else {
      style.width = `${width}px`
    }
  }

  if (typeof height === 'number') {
    if (heightOnMobile !== undefined) {
      style['--height-desktop'] = `${height}px`
      style['--height-mobile'] = `${heightOnMobile}px`
    } else {
      style.height = `${height}px`
    }
  }

  return (
    <div
      className={cn(
        'shrink-0',
        widthOnMobile !== undefined &&
          '[width:var(--width-mobile)] md:[width:var(--width-desktop)]',
        heightOnMobile !== undefined &&
          '[height:var(--height-mobile)] md:[height:var(--height-desktop)]',
        fillRow && 'flex-grow mx-auto',
        fillColumn && 'flex-grow my-auto',
        className,
      )}
      style={style as React.CSSProperties}
      {...rest}
    />
  )
}
