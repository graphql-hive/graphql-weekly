import * as React from 'react'
import { Nav } from '../../shared/Nav'
import { Space } from '../../shared/Space'
import { Container } from '../../shared/Container'
import { Subscription } from '../Subscription'
import Slack from '../../vectors/Slack'
import Twitter from '../../vectors/Twitter'

type Props = {
  submitModalClickHandler: Function
}

export const Header = (props: Props) => {
  return (
    <>
      <style>{`
        header.header-bg {
          background-image: url(/header-bg.svg);
        }
        @media (max-width: 1000px) {
          header.header-bg {
            background-image: url(/header-bg-mobile.jpg);
          }
        }
      `}</style>
      <header className="header-bg bg-[#d60690] bg-no-repeat bg-top bg-center min-h-[595px] pb-[100px] md:pb-0">
        <Nav submitModalClickHandler={props.submitModalClickHandler} />

        <Space height={80} heightOnMobile={27} />

        <Container>
          <h1 className="m-0 mx-auto max-w-[667px] font-normal text-2xl leading-[1.33] md:text-[44px] md:leading-[1.1] text-center text-white px-[17px] md:px-0 [&_strong]:font-medium">
            A weekly newsletter of the best <strong>news</strong>,{' '}
            <strong>articles</strong> and <strong>projects</strong> about
            GraphQL
          </h1>

          <Space height={56} heightOnMobile={32} />

          <Subscription />

          <div className="w-auto flex justify-center mt-10 px-[50px] md:hidden">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-auto h-[22px] flex items-center font-medium leading-none text-lg text-white [&_svg]:mr-4 [&_svg]:opacity-80 [&_path]:stroke-white"
            >
              <Twitter />
              Twitter
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-auto h-[22px] flex items-center font-medium leading-none text-lg text-white [&_svg]:mr-4 [&_svg]:opacity-80 [&_path]:stroke-white ml-10"
            >
              <Slack stroke="#ffffff" />
              Slack
            </a>
          </div>
        </Container>
      </header>
    </>
  )
}
