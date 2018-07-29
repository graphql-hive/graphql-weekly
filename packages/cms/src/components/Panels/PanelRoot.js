import React from "react";
import styled, { keyframes } from "react-emotion";
import CardBody from "../CardBody";
import ClickTarget from "../ClickTarget";
import X from "../../icons/X";
import { colors } from "../../style/colors";
import PanelConsumer from "./PanelConsumer";

const FadeRight = keyframes`
  from {
    opacity: 0;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
`;

const Scrim = styled("div")`
  position: fixed;
  width: 100%;
  z-index: 11;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.56);
`;

const Panel = styled("div")`
  max-width: 640px;
  height: 100vh;
  overflow: hidden;
  margin: 0 0 0 auto;
  z-index: 11;
  animation: ${FadeRight};
  -webkit-animation-duration: 0.15s;
  animation-duration: 0.15s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
`;

const PanelCard = styled("div")`
  background-color: white;
  border-radius: 0px;
  height: 100%;
`;

const PanelHeader = styled("div")`
  padding: 16px 12px 16px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: right;
`;

const PanelClose = styled("p")`
  margin: 0;
  color: rgb(91, 134, 229);
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  &:hover {
    text-decoration: underline;
  }
`;

class PanelBody extends React.Component {
  constructor() {
    super();
    this.closePanel = this.closePanel.bind(this);
  }

  closePanel() {
    if (this.props.isOpen) {
      this.props.hidePanel();
    }
  }
  render() {
    const { hidePanel, Component, ...rest } = this.props;
    return (
      <Scrim id="panelRoot" onClick={this.closePanel}>
        <Panel
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <PanelCard>
            <section>
              <PanelHeader>
                <ClickTarget onClick={hidePanel}>
                  <PanelClose>
                    <X size={14} color={colors.blue} />
                  </PanelClose>
                </ClickTarget>
              </PanelHeader>
              <CardBody>
                <Component {...rest} onPanelClose={hidePanel} />
              </CardBody>
            </section>
          </PanelCard>
        </Panel>
      </Scrim>
    );
  }
}

export default function PanelRoot() {
  return (
    <PanelConsumer>
      {({ component: Component, props, hidePanel }) => {
        return Component ? (
          <PanelBody hidePanel={hidePanel} Component={Component} {...props} />
        ) : null;
      }}
    </PanelConsumer>
  );
}
