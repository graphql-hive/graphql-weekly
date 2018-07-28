import React from "react";
import styled from "react-emotion";
import { colors } from "../style/colors";

import Content from "./Content";

const HeaderContainer = styled("section")`
  background-color: ${colors.dark};
  padding: 16px;
`;

const Header = styled("h1")`
  font-size: 19px;
  line-height: 24px;
  color: white;
  margin: 0;
`;

export default function Topic({ topic, topics, refresh }) {
  return (
    <section style={{ marginBottom: "10px" }}>
      <HeaderContainer>
        <Header>{topic.title}</Header>
      </HeaderContainer>
      <section style={{ border: `1px solid ${colors.gray}` }}>
        {topic.links.map((link, index) => (
          <Content
            link={link}
            key={link.id}
            linkId={link.id}
            topics={topics}
            refresh={refresh}
          />
        ))}
      </section>
    </section>
  );
}
