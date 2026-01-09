import { Component, type CSSProperties } from 'react'

import { Arrow } from '../../vectors/Arrow'
// Local
import { Container } from '../Container'
import { Link } from '../Link'
import { Button } from './Button'
import { Close } from './Close'
import { LogoSvg } from './Logo'

type Props = { submitModalClickHandler: () => void }
type State = { isOpened: boolean }

export class Nav extends Component<Props, State> {
  state = { isOpened: false }

  menuClickHandler = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    })
  }

  render() {
    const { isOpened } = this.state
    return (
      <Container>
        <div
          className="shrink-0 h-(--height-mobile) md:h-(--height-desktop)"
          style={
            {
              '--height-desktop': '40px',
              '--height-mobile': '32px',
            } as CSSProperties
          }
        />
        <nav className="flex min-h-[52px] justify-between flex-wrap px-6 md:flex-nowrap md:px-0">
          <Link className="inline-flex items-center -ml-1.5 md:ml-0" to="/">
            <LogoSvg />
          </Link>

          <button
            className="w-auto h-5 mt-2.5 mr-1.5 cursor-pointer md:hidden border-none bg-transparent p-0"
            onClick={this.menuClickHandler}
            type="button"
          >
            {isOpened ? <Close /> : <Button />}
          </button>

          <div
            className={`
            flex justify-end items-center h-[52px] overflow-hidden
            w-full md:w-auto md:h-[52px]
            flex-col md:flex-row
            items-center md:items-center
            ${
              isOpened
                ? 'h-auto pt-7 pb-5 border-b border-white/50'
                : 'h-0 pt-0'
            }
            md:h-[52px]! md:pt-0! md:pb-0! md:border-0!
          `}
          >
            <a
              className="cursor-pointer ml-0 py-3 md:ml-10 md:py-0"
              href="https://www.howtographql.com"
              rel="noreferrer"
              target="_blank"
            >
              <span className="mr-3 font-medium leading-none text-lg text-white">
                What is GraphQL?
              </span>
              <Arrow />
            </a>
            <button
              className="border-none bg-none outline-hidden cursor-pointer ml-0 py-3 md:ml-10 md:py-0"
              onClick={() => this.props.submitModalClickHandler()}
            >
              <span className="mr-3 font-medium leading-none text-lg text-white">
                Submit a link
              </span>
            </button>
          </div>
        </nav>
      </Container>
    )
  }
}
