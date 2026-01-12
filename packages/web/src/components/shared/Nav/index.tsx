import { Component, type CSSProperties } from "react";

import { cn } from "#src/lib/cn";

import { Arrow } from "../../vectors/Arrow";
// Local
import { Container } from "../Container";
import { Link } from "../Link";
import { Button } from "./Button";
import { Close } from "./Close";
import { LogoSvg } from "./Logo";

type Props = { submitModalClickHandler: () => void };
type State = { isOpened: boolean };

export class Nav extends Component<Props, State> {
  state = { isOpened: false };

  menuClickHandler = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  };

  render() {
    const { isOpened } = this.state;
    return (
      <Container>
        <div
          className="shrink-0 h-(--height-mobile) md:h-(--height-desktop)"
          style={
            {
              "--height-desktop": "40px",
              "--height-mobile": "32px",
            } as CSSProperties
          }
        />
        <nav className="flex min-h-13 justify-between flex-wrap px-6 md:flex-nowrap md:px-0">
          <Link
            aria-label="Go to main page"
            className="inline-flex items-center -ml-1.5 md:ml-0"
            to="/"
          >
            <LogoSvg className="h-full w-auto" />
          </Link>

          <button
            className="w-auto h-5 mt-2.5 mr-1.5 cursor-pointer md:hidden border-none bg-transparent p-0"
            onClick={this.menuClickHandler}
            type="button"
          >
            {isOpened ? <Close /> : <Button />}
          </button>

          <div
            className={cn(
              "flex justify-end h-13 overflow-hidden items-center w-full md:w-auto flex-col md:flex-row md:h-13 md:pt-0 md:pb-0 md:border-0 gap-6",
              isOpened
                ? "h-auto pt-7 pb-5 border-b border-white/50"
                : "h-0 pt-0"
            )}
          >
            <a
              className="cursor-pointer ml-0 p-3 flex items-center hover:bg-white/10 rounded-md"
              href="https://www.howtographql.com"
              rel="noreferrer"
              target="_blank"
            >
              <span className="mr-3 font-medium  text-lg text-white">
                What is GraphQL?
              </span>
              <Arrow className="mt-px" />
            </a>
            <button
              className="border-none bg-none outline-hidden cursor-pointer ml-0 p-3 hover:bg-white/10 rounded-md text-lg text-white font-medium"
              onClick={() => this.props.submitModalClickHandler()}
            >
              Submit a link
            </button>
          </div>
        </nav>
      </Container>
    );
  }
}
