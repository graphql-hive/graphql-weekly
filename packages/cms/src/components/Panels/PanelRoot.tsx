import { Component, ComponentType, MouseEvent } from "react";

import X from "../../icons/X";
import { colors } from "../../style/colors";
import CardBody from "../CardBody";
import ClickTarget from "../ClickTarget";
import PanelConsumer from "./PanelConsumer";

interface PanelBodyProps {
  Component: ComponentType<{ onPanelClose: () => void }>;
  componentProps: Record<string, unknown>;
  hidePanel: () => void;
  isOpen?: boolean;
}

class PanelBody extends Component<PanelBodyProps> {
  closePanel = () => {
    if (this.props.isOpen) {
      this.props.hidePanel();
    }
  };

  override render() {
    const { Component: PanelComponent, componentProps, hidePanel } = this.props;
    return (
      <div
        className="fixed w-full z-[11] h-full bg-black/[0.56]"
        id="panelRoot"
        onClick={this.closePanel}
      >
        <div
          className="max-w-[640px] h-screen overflow-hidden ml-auto z-[11] animate-[fade-right_0.15s_both]"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <div className="bg-white h-full">
            <section>
              <div className="py-4 px-3 pl-2 border-b border-black/[0.12] text-right">
                <ClickTarget onClick={hidePanel}>
                  <p className="m-0 text-[rgb(91,134,229)] text-sm leading-[18px] hover:underline">
                    <X color={colors.blue} size={14} />
                  </p>
                </ClickTarget>
              </div>
              <CardBody>
                <PanelComponent {...componentProps} onPanelClose={hidePanel} />
              </CardBody>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default function PanelRoot() {
  return (
    <PanelConsumer>
      {({ component: PanelComponent, hidePanel, props }) => {
        return PanelComponent ? (
          <PanelBody
            Component={PanelComponent}
            componentProps={props}
            hidePanel={hidePanel}
            isOpen={props.isOpen as boolean}
          />
        ) : null;
      }}
    </PanelConsumer>
  );
}
