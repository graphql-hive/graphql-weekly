import * as React from 'react'

// Local
import styled from '../../style/styled'
import { PrimaryButton } from '../../shared/Buttons/Index'
import Mail from '../../vectors/Mail'

type Props = {
  submitModalClickHandler: Function
}

export const Submit = (props: Props) => {
  return (
    <Wrapper>
      <Icon><Mail /></Icon>
      <Title>Share the goods</Title>
      <Body>Found a cool GraphQL resource? Tell us all about it!</Body>
      <PrimaryButton
        onClick={() => props.submitModalClickHandler()}
        text="Submit Link" />
    </Wrapper>
  )
}

// Styles
const Wrapper = styled.div`
  margin-left: 23px;
  max-width: 300px;
`

const Icon = styled.div`
  margin-left: -10px;
  margin-top: -32px;
`

const Title = styled.div`
  margin-top: 16px;

  font-weight: 500;
  line-height: 1;
  font-size: 18px;
  text-transform: uppercase;

  color: #9da0b5;
`

const Body = styled.div`
  margin: 12px 0 24px 0;

  font-weight: 500;
  font-size: 18px;
  line-height: 24px;

  color: ${p => p.theme.dark};
`