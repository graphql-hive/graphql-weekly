import * as React from 'react'

// Local
import styled from '../../style/styled'
import LogoSvg from './PrismaLogo'

export const About = () => {
  return (
    <Wrapper>
      <Logo>
        <LogoSvg />
      </Logo>
      <Text>Curated by <Link href='https://www.prisma.io/'>Prisma</Link> and its awesome community.</Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;

  justify-content: center;
  align-items: center;
`

const Text = styled.div`
  font-weight: 400;
  line-height: 24px;
  font-size: 18px;

  color: rgba(255, 255, 255, 0.33);

  a {
    text-decoration: underline;
    color: rgba(255, 255, 255, 0.5);
  }
`

const Link = styled.a``

const Logo = styled.div`
  color: white;
  opacity: 0.33;
  margin-right: 16px;
`