import * as React from 'react'

// Local
import styled from '../../style/styled'

export const SideBanner =  ({ target, image }: Props) => {
  return (
    <Wrapper>
        <a href="https://graphql.org/conf/" target="_blank">
            <img src="/graphqlconf.png" width="339px"/>
        </a>
    </Wrapper>
  )
}

// Styles
const Wrapper = styled.div`
  margin-left: 23px;
  max-width: 300px;
`
