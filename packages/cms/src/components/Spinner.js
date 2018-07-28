import React from "react";
import styled from "react-emotion";

export default ({ color, size }: Props) => (
  <Wrapper className="loader" color={color || "grey"} size={size || 40} />
);

const colors = {
  white: {
    bg: "rgba(255,255,255,0.2)",
    fg: "rgba(255,255,255,1)"
  },
  grey: {
    bg: "rgba(120,120,120,0.2)",
    fg: "rgba(120,120,120,1)"
  }
};

const Wrapper = styled("div")`
  &,
  &:after {
    border-radius: 50%;
    width: ${p => p.size}px;
    height: ${p => p.size}px;
  }
  & {
    font-size: 10px;
    position: relative;
    text-indent: -9999em;
    border-top: ${p => p.size / 12}px solid ${p => colors[p.color].bg};
    border-right: ${p => p.size / 12}px solid ${p => colors[p.color].bg};
    border-bottom: ${p => p.size / 12}px solid ${p => colors[p.color].bg};
    border-left: ${p => p.size / 12}px solid ${p => colors[p.color].fg};
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: loader 0.7s infinite ease-out;
    animation: loader 0.7s infinite ease-out;
  }
  @-webkit-keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;
