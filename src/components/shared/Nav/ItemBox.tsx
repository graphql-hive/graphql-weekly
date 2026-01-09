import * as React from 'react'
import { cn } from '../../../lib/cn'
import ChevronRight from '../../vectors/ChevronRight'
import type { ThemedProps } from '../../style/theme'
import { Link } from '../Link'

type Props = {
  tag?: string
  outline?: boolean
  to?: string
  href?: string
  title: string
  desc: string
  primaryColor?: (p: ThemedProps) => string
  secondaryColor?: (p: ThemedProps) => string
}

export const ItemBox = (props: Props) => {
  return (
    <Link
      to={props.to}
      href={props.href}
      className={cn(
        'flex flex-col p-5 rounded w-1/2 flex-shrink flex-grow-0 flex-auto shadow-[0px_3px_6px_rgba(8,35,51,0.05)] transition-[background] duration-[140ms] ease-out select-none cursor-pointer',
        props.outline
          ? 'bg-none shadow-[0_0_1px_rgba(90,120,150,0.3)] hover:bg-[rgba(90,120,150,0.2)] active:bg-[rgba(90,120,150,0.3)]'
          : 'bg-white hover:bg-[#f7f9fa] active:bg-[#f7f9fa]',
      )}
    >
      {props.tag && (
        <div
          className="h-6 px-[10px] py-[6px] mb-3 self-start text-[12px] font-bold leading-none uppercase rounded-xl"
          style={{
            background: props.secondaryColor
              ? props.secondaryColor({} as ThemedProps)
              : undefined,
            color: props.primaryColor
              ? props.primaryColor({} as ThemedProps)
              : undefined,
          }}
        >
          {props.tag}
        </div>
      )}
      <div
        className={cn(
          'mb-2 leading-none text-lg font-semibold inline-flex items-center [&_svg]:ml-3 [&_svg]:inline-block [&_svg]:mt-px',
          props.outline ? 'text-white' : 'text-primary',
        )}
      >
        {props.title}
        <ChevronRight opacity={0.5} />
      </div>

      <div className="text-[#9da0b5] leading-[1.25]">{props.desc}</div>
    </Link>
  )
}
