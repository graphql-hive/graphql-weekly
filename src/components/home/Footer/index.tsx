import { Container } from "../../shared/Container";
import { About } from "./About";
import { FooterLine } from "./FooterLine";
import { Playground } from "./Playground";
import { TopFooter } from "./TopFooter";

export const Footer = () => {
  return (
    <footer className="relative min-h-[1048px] py-16 px-0 bg-footer-dark md:block hidden before:absolute before:top-0 before:left-0 before:w-full before:h-10 before:content-[''] before:bg-linear-to-b before:from-[rgba(4,11,54,0.33)] before:to-[rgba(4,11,54,0)]">
      <Container>
        <TopFooter />
        <FooterLine />
        <Playground />
        <FooterLine />
        <About />
      </Container>
    </footer>
  );
};
