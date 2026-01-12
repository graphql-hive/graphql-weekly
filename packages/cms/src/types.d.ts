declare module "url-regex" {
  function urlRegex(options?: { exact?: boolean; strict?: boolean }): RegExp;
  export default urlRegex;
}

declare module "react-emotion" {
  import {
    ComponentType,
    HTMLAttributes,
    ClassAttributes,
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
  } from "react";

  type Interpolation<P> =
    | string
    | number
    | ((props: P & { theme?: unknown }) => string | number | undefined)
    | undefined;

  type StyledComponent<P, A> = ComponentType<P & A & { className?: string }>;

  interface CreateStyled {
    <P extends object = {}>(
      tag: "a",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      AnchorHTMLAttributes<HTMLAnchorElement> &
        ClassAttributes<HTMLAnchorElement>
    >;
    <P extends object = {}>(
      tag: "button",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      ButtonHTMLAttributes<HTMLButtonElement> &
        ClassAttributes<HTMLButtonElement>
    >;
    <P extends object = {}>(
      tag: "div",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLDivElement> & ClassAttributes<HTMLDivElement>
    >;
    <P extends object = {}>(
      tag: "form",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLFormElement> & ClassAttributes<HTMLFormElement>
    >;
    <P extends object = {}>(
      tag: "h1",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLHeadingElement> & ClassAttributes<HTMLHeadingElement>
    >;
    <P extends object = {}>(
      tag: "img",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLImageElement> & ClassAttributes<HTMLImageElement>
    >;
    <P extends object = {}>(
      tag: "input",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>
    >;
    <P extends object = {}>(
      tag: "label",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLLabelElement> & ClassAttributes<HTMLLabelElement>
    >;
    <P extends object = {}>(
      tag: "nav",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLElement> & ClassAttributes<HTMLElement>
    >;
    <P extends object = {}>(
      tag: "p",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLParagraphElement> &
        ClassAttributes<HTMLParagraphElement>
    >;
    <P extends object = {}>(
      tag: "section",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLElement> & ClassAttributes<HTMLElement>
    >;
    <P extends object = {}>(
      tag: "span",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLSpanElement> & ClassAttributes<HTMLSpanElement>
    >;
    <P extends object = {}>(
      tag: "textarea",
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      TextareaHTMLAttributes<HTMLTextAreaElement> &
        ClassAttributes<HTMLTextAreaElement>
    >;
    <P extends object = {}>(
      tag: string,
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => StyledComponent<
      P,
      HTMLAttributes<HTMLElement> & ClassAttributes<HTMLElement>
    >;
    <P extends object = {}, C extends ComponentType<any> = ComponentType<any>>(
      component: C,
    ): (
      strings: TemplateStringsArray,
      ...interpolations: Interpolation<P>[]
    ) => ComponentType<P & React.ComponentProps<C>>;
  }

  const styled: CreateStyled;
  export default styled;

  export function keyframes(
    strings: TemplateStringsArray,
    ...interpolations: Interpolation<{}>[]
  ): string;
}
