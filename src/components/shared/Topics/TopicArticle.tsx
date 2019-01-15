import * as React from 'react'
import styled from 'styled-components'
import { mobile } from '../../style/media'
import { css } from '../../style/styled'
import { TitleArrow } from '../../vectors/TitleArrow'

type Props = {
  title: string
  text: string
  url: string
  topicColor?: string
  specialPerk?: string
}

export const TopicArticle = ({ title, text, url, topicColor, specialPerk }: Props) => {
  const isTextSafe = !text.includes('<') || /<(p|strong|i|a) ?.*>/.test(text)
  return (
    <Wrapper>
      <Title href={url} target="_blank">
        {title}
        <Arrow color={topicColor || "#0a1659"}><TitleArrow /></Arrow>
      </Title>

      {isTextSafe ? (
        <Text dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
        <Text children={text} />
      )}

      {specialPerk && (
        <Text>
          <strong>Special perk:</strong>
          {specialPerk}
        </Text>
      )}
    </Wrapper>
  )
}

const Title = styled.a`
margin: 0;
font-weight: 500;
line-height: 1.33;
font-size: 24px;

&&&& {
  text-decoration: none;
  color: #081146;
}

${mobile(css`
margin-top: 20px;
font-size: 18px;
`)};
`

const Arrow = styled.div<{color: string}>`
  position: relative;
  top: -2px; // Ugh I hate inline positioning
  display: inline-block;
  margin-left: 10px;
  color: ${p => p.color};
  opacity: 0;
`

const Text = styled.p`
  font-weight: 400;
  line-height: 1.75;
  font-size: 16px;

  color: #081146;

  strong {
    font-weight: 500;

    ::after {
      content: ' ';
    }
  }
`

const Wrapper = styled.div`
  &:hover {
    ${Arrow} { opacity: 1; }
  }
`