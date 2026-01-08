import type { Modifiers, Placement } from 'popper.js'

import * as React from 'react'
import { Popper } from 'react-popper'

import type { InputColor } from '../../style/theme'

import { cn } from '../../../lib/cn'
import { HorizentalCaret, VerticalCaret } from '../../vectors/Caret'

const caretWidth = 24
const caretHeight = 10

type Props = {
  arrowColor?: InputColor
  arrowLeftOrTop?: string
  arrowProps?: Record<string, any>
  bgColor?: InputColor
  children?: React.ReactNode
  hasShadow?: boolean
  height?: number
  maxHeight?: number
  maxWidth?: number
  position: 'bottom' | 'left' | 'right' | 'top' | string
  rectangleRef?: React.RefObject<HTMLDivElement>
  setByPopper?: boolean
  style?: any
  width?: number
}

const reversePosMap = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
}

export const Popover = React.forwardRef((props: Props, ref: any) => {
  const {
    arrowColor,
    arrowLeftOrTop,
    arrowProps,
    bgColor,
    children,
    hasShadow,
    height,
    maxHeight,
    maxWidth,
    position: popoverPostion,
    rectangleRef,
    setByPopper,
    width,
    ...wrapperProps
  } = props

  const angle =
    popoverPostion === 'top' || popoverPostion === 'bottom'
      ? 'horizental'
      : 'vertical'
  // @ts-ignore
  const caretPosition: string = reversePosMap[popoverPostion]
  const isCaretFirst = caretPosition === 'top' || caretPosition === 'left'
  const isCaretFliped = caretPosition === 'bottom' || caretPosition === 'left'

  const { ref: arrowInnerRef = null, ...restOfArrowProps } = arrowProps || {}

  return (
    <div
      className={cn(
        'flex items-stretch flex-auto relative z-[999]',
        angle === 'horizental' ? 'flex-col' : 'flex-row',
      )}
      ref={ref}
      style={{
        height: height ? `${height}px` : 'auto',
        width: width ? `${width}px` : 'auto',
      }}
      {...wrapperProps}
    >
      <div
        className={cn(
          'flex justify-center relative flex-grow-0 flex-shrink-0',
          angle === 'horizental' ? 'flex-row' : 'flex-col',
          arrowLeftOrTop && 'justify-start',
          angle === 'horizental' ? 'flex-row' : 'flex-col',
          isCaretFliped &&
            (angle === 'horizental' ? 'scale-y-[-1]' : 'scale-x-[-1]'),
          isCaretFirst ? 'order-0' : 'order-1',
          '[&_svg]:fill-white',
        )}
        ref={arrowInnerRef}
        style={{
          flexBasis: `${caretHeight}px`,
          height: setByPopper
            ? undefined
            : (angle === 'horizental'
              ? `${caretHeight}px`
              : '100%'),
          width: setByPopper
            ? `${caretWidth}px`
            : (angle === 'horizental'
              ? '100%'
              : `${caretHeight}px`),
          zIndex: 100,
          ...(arrowLeftOrTop
            ? {
                [`padding${angle === 'horizental' ? 'Left' : 'Top'}`]:
                  arrowLeftOrTop,
              }
            : {}),
        }}
        {...restOfArrowProps}
      >
        <style>{`
          .popover-rectangle::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {arrowColor && (
          <style>{`
            .popover-caret svg {
              fill: ${arrowColor};
            }
          `}</style>
        )}
        <div className="popover-caret">
          {angle === 'horizental' ? <HorizentalCaret /> : <VerticalCaret />}
        </div>
      </div>

      <div
        className={cn(
          'popover-rectangle flex-grow flex-auto h-full w-full overflow-auto relative rounded-lg bg-white',
          hasShadow &&
            'shadow-[0_3px_12px_rgba(0,0,0,0.04),0_0_2px_rgba(0,0,0,0.03)]',
        )}
        ref={rectangleRef}
        style={{
          [`margin${caretPosition?.charAt(0).toUpperCase()}${caretPosition?.slice(1)}`]:
            '-1px',
          background: bgColor || 'white',
          maxHeight: maxHeight ? `${maxHeight}px` : 'auto',
          maxWidth: maxWidth ? `${maxWidth}px` : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
})

export { Manager, Reference } from 'react-popper'

export const PopperPopover = (props: {
  children?: any
  modifiers?: Modifiers
  position: Placement
}) => {
  return (
    <Popper placement={props.position}>
      {({ arrowProps, placement, ref, style }) => (
        <Popover
          arrowProps={arrowProps}
          children={props.children}
          data-placement={placement}
          position={String(placement)}
          ref={ref}
          setByPopper
          style={style}
        />
      )}
    </Popper>
  )
}

export default PopperPopover
