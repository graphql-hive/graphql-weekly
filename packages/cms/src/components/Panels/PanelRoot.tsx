import { Component, ComponentType, MouseEvent } from "react";
import CardBody from "../CardBody";
import ClickTarget from "../ClickTarget";
import X from "../../icons/X";
import { colors } from "../../style/colors";
import PanelConsumer from "./PanelConsumer";

interface PanelBodyProps {
  isOpen?: boolean;
  hidePanel: () => void;
  Component: ComponentType<{ onPanelClose: () => void }>;
  componentProps: Record<string, unknown>;
}

class PanelBody extends Component<PanelBodyProps> {
  closePanel = () => {
    if (this.props.isOpen) {
      this.props.hidePanel();
    }
  };

  override render() {
    const { hidePanel, Component: PanelComponent, componentProps } = this.props;
    return (
      <div
        id="panelRoot"
        onClick={this.closePanel}
        className="fixed w-full z-[11] h-full bg-black/[0.56]"
      >
        <div
          onClick={(e: MouseEvent) => e.stopPropagation()}
          className="max-w-[640px] h-screen overflow-hidden ml-auto z-[11] animate-[fade-right_0.15s_both]"
        >
          <div className="bg-white h-full">
            <section>
              <div className="py-4 px-3 pl-2 border-b border-black/[0.12] text-right">
                <ClickTarget onClick={hidePanel}>
                  <p className="m-0 text-[rgb(91,134,229)] text-sm leading-[18px] hover:underline">
                    <X size={14} color={colors.blue} />
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
      {({ component: PanelComponent, props, hidePanel }) => {
        return PanelComponent ? (
          <PanelBody
            hidePanel={hidePanel}
            Component={PanelComponent}
            componentProps={props}
            isOpen={props.isOpen as boolean}
          />
        ) : null;
      }}
    </PanelConsumer>
  );
}
