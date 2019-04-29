import * as React from 'react'

// Local
import { Container } from '../Container'
import {
  Wrapper,
  LogoWrapper,
  NavItems,
  NavItem,
  NavItemButton,
  NavText,
  MenuButton,
} from './style'
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
    return (
      <Container>
        <Space height={40} heightOnMobile={32} />
        <Wrapper>
          <LogoWrapper to="/">
            <LogoSvg />
          </LogoWrapper>

          <MenuButton onClick={this.menuClickHandler}>
            {this.state.isOpened ? <Close /> : <Button />}
          </MenuButton>

          <NavItems isOpened={this.state.isOpened}>
            <NavItem href="https://graphqlconf.org" target="_blank">
              <NavText>GraphQL Conf 2019</NavText>
              <Arrow />
            </NavItem>
            <NavItem href="https://www.howtographql.com" target="_blank">
              <NavText>What is GraphQL?</NavText>
              <Arrow />
            </NavItem>
            <NavItemButton onClick={() => this.props.submitModalClickHandler()}>
              <NavText>Submit a link</NavText>
            </NavItemButton>
          </NavItems>
        </Wrapper>
      </Container>
    )
  }
}
