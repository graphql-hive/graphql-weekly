import styled from "react-emotion"
import { darken } from "polished"
import { Link } from "react-router-dom"
import { shadows } from "../style/colors"

type ButtonColor = "red" | "green" | "grey" | "grey-bg"

const colorMap: Record<ButtonColor, string> = {
  red: "white",
  green: "white",
  grey: "#3D556B",
  "grey-bg": "white"
}

const backgroundColorMap: Record<ButtonColor, string> = {
  red: "#ff4f56",
  green: "#15BD76",
  grey: "white",
  "grey-bg": "#8fa6b2"
}

interface ButtonProps {
  block?: boolean | undefined
  disabled?: boolean | undefined
  margin?: string | undefined
  color?: ButtonColor | undefined
}

export const Button = styled<ButtonProps>("button")`
  padding: 11px 14px;
  display: ${(p) => (p.block ? "" : "inline-")}block;
  ${(p) => (p.block ? "width: 100%;" : "")} border: none;
  box-sizing: border-box;
  outline: none;
  opacity: ${(p) => (p.disabled ? "0.2" : 1)};
  text-transform: uppercase;
  margin: ${(p) => p.margin || 0};
  background: ${(p) => backgroundColorMap[p.color || "green"]};
  color: ${(p) => colorMap[p.color || "green"]};
  line-height: 1;
  font-size: 14px;
  font-weight: 700;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  pointer-events: ${(p) => (p.disabled ? "none" : "all")};
  border-radius: 6px;

  box-shadow: 0px 3px 3px rgba(12, 52, 75, 0.05);

  transition: 0.2s linear all;

  &:hover {
    background: ${(p) => darken(0.04, backgroundColorMap[p.color || "green"])};
  }

  &:focus {
    background: ${(p) => darken(0.07, backgroundColorMap[p.color || "green"])};
  }
`

export const ButtonLink = styled<ButtonProps>(Link)`
  padding: 11px 14px;
  display: ${(p) => (p.block ? "" : "inline-")}block;
  ${(p) => (p.block ? "width: 100%;" : "")} border: none;
  box-sizing: border-box;
  outline: none;
  opacity: ${(p) => (p.disabled ? "0.2" : 1)};
  text-transform: uppercase;

  background: ${(p) => backgroundColorMap[p.color || "green"]};
  color: ${(p) => colorMap[p.color || "green"]};
  line-height: 1;
  font-size: 14px;
  font-weight: 700;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  pointer-events: ${(p) => (p.disabled ? "none" : "all")};
  border-radius: 6px;

  box-shadow: ${shadows.normal};

  transition: 0.2s linear all;

  &:hover {
    background: ${(p) => darken(0.04, backgroundColorMap[p.color || "green"])};
    color: ${(p) => colorMap[p.color || "green"]};
  }

  &:focus {
    background: ${(p) => darken(0.07, backgroundColorMap[p.color || "green"])};
    color: ${(p) => colorMap[p.color || "green"]};
  }
`
