import * as React from 'react'
import { Popper } from 'react-popper'
import type { Placement, Modifiers } from 'popper.js'
import { cn } from '../../../lib/cn'
import { HorizentalCaret, VerticalCaret } from '../../vectors/Caret'
import type { InputColor } from '../../style/theme'

const caretWidth = 24
const caretHeight = 10

type Props = {
  position: 'bottom' | 'top' | 'right' | 'left' | string
  arrowProps?: { [x: string]: any }
  children?: React.ReactNode
  setByPopper?: boolean
  style?: any
  bgColor?: InputColor
  arrowColor?: InputColor
  arrowLeftOrTop?: string
  maxHeight?: number
  maxWidth?: number
  rectangleRef?: React.RefObject<HTMLDivElement>
  hasShadow?: boolean
  width?: number
  height?: number
}

const reversePosMap = {
  bottom: 'top',
  top: 'bottom',
  right: 'left',
  left: 'right',
}

export const Popover = React.forwardRef((props: Props, ref: any) => {
  const {
    position: popoverPostion,
    arrowProps,
    setByPopper,
    bgColor,
    arrowColor,
    arrowLeftOrTop,
    maxHeight,
    maxWidth,
    rectangleRef,
    children,
    hasShadow,
    width,
    height,
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
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
      ref={ref}
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
        style={{
          width: !setByPopper
            ? angle === 'horizental'
              ? '100%'
              : `${caretHeight}px`
            : `${caretWidth}px`,
          height: !setByPopper
            ? angle === 'horizental'
              ? `${caretHeight}px`
              : '100%'
            : undefined,
          zIndex: 100,
          flexBasis: `${caretHeight}px`,
          ...(arrowLeftOrTop
            ? {
                [`padding${angle === 'horizental' ? 'Left' : 'Top'}`]:
                  arrowLeftOrTop,
              }
            : {}),
        }}
        ref={arrowInnerRef}
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
        ref={rectangleRef}
        className={cn(
          'popover-rectangle flex-grow flex-auto h-full w-full overflow-auto relative rounded-lg bg-white',
          hasShadow &&
            'shadow-[0_3px_12px_rgba(0,0,0,0.04),0_0_2px_rgba(0,0,0,0.03)]',
        )}
        style={{
          maxHeight: maxHeight ? `${maxHeight}px` : 'auto',
          maxWidth: maxWidth ? `${maxWidth}px` : 'auto',
          background: bgColor || 'white',
          [`margin${caretPosition?.charAt(0).toUpperCase()}${caretPosition?.slice(1)}`]:
            '-1px',
        }}
      >
        {children}
      </div>
    </div>
  )
})

export { Manager, Reference } from 'react-popper'

export const PopperPopover = (props: {
  position: Placement
  modifiers?: Modifiers
  children?: any
}) => {
  return (
    <Popper placement={props.position}>
      {({ ref, style, placement, arrowProps }) => (
        <Popover
          setByPopper={true}
          position={String(placement)}
          ref={ref}
          style={style}
          data-placement={placement}
          arrowProps={arrowProps}
          // eslint-disable-next-line
          children={props.children}
        />
      )}
    </Popper>
  )
}

export default PopperPopover
