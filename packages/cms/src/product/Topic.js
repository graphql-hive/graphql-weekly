import React from "react";
import { colors } from "../style/colors";
import { HeaderContainer, Header } from "./Headers";
import Content from "./Content";

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
