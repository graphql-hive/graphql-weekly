import * as React from 'react'

// Local
import { Container } from '../Container'
import { Link } from '../Link'
import LogoSvg from './Logo'
import { Space } from '../Space'
import Button from './Button'
import Close from './Close'
import { Arrow } from '../../vectors/Arrow'

type Props = { submitModalClickHandler: Function }
type State = { isOpened: boolean }

export class Nav extends React.Component<Props, State> {
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
        <Space height={40} heightOnMobile={32} />
        <nav className="flex min-h-[52px] justify-between flex-wrap px-6 md:flex-nowrap md:px-0">
          <Link to="/" className="inline-flex items-center -ml-1.5 md:ml-0">
            <LogoSvg />
          </Link>

          <span
            onClick={this.menuClickHandler}
            className="w-auto h-5 mt-2.5 mr-1.5 cursor-pointer md:hidden"
          >
            {isOpened ? <Close /> : <Button />}
          </span>

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
            md:!h-[52px] md:!pt-0 md:!pb-0 md:!border-0
          `}
          >
            <a
              href="https://www.howtographql.com"
              target="_blank"
              className="cursor-pointer ml-0 py-3 md:ml-10 md:py-0"
            >
              <span className="mr-3 font-medium leading-none text-lg text-white">
                What is GraphQL?
              </span>
              <Arrow />
            </a>
            <button
              onClick={() => this.props.submitModalClickHandler()}
              className="border-none bg-none outline-none cursor-pointer ml-0 py-3 md:ml-10 md:py-0"
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
