import * as React from 'react'

// Local
import styled from '../../style/styled'

export const About = () => {
  return (
    <Wrapper>
      <Text>
        Curated by <Link href="https://graphcdn.io/">GraphCDN</Link>,{' '}
        and the awesome
        GraphQL community.
      </Text>
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