import * as React from 'react'

// Local
import styled from '../../style/styled'

export const SideBanner =  ({ target, image }: Props) => {
  return (
    <Wrapper>
        <a href="https://youtube.com/playlist?list=PLP1igyLx8foEO0qsyk3IFn1peYSVGDBFA&si=QjgZ1xXp6pIfKFTv&utm_source=graphql_weekly&utm_medium=website&utm_campaign=cta" target="_blank">
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
