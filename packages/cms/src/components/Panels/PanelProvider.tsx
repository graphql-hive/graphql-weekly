import { Component, ComponentType, ReactNode } from "react";

import PanelContext, { PanelContextValue } from "./PanelContext";

interface PanelProviderProps {
  children: ReactNode;
}

export default class PanelProvider extends Component<
  PanelProviderProps,
  PanelContextValue
> {
  constructor(props: PanelProviderProps) {
    super(props);
    /* eslint-disable react/no-unused-state -- state is passed to context provider */
    this.state = {
      component: null,
      hidePanel: this.hidePanel,
      props: {},
      showPanel: this.showPanel,
    };
    /* eslint-enable react/no-unused-state */
  }

  showPanel = (
    component: ComponentType<{ onPanelClose: () => void }>,
    props: Record<string, unknown> = {},
  ) => {
    /* eslint-disable react/no-unused-state -- state is passed to context provider */
    this.setState({
      component,
      props: {
        ...props,
        isOpen: true,
      },
    });
    /* eslint-enable react/no-unused-state */
  };

  hidePanel = () => {
    /* eslint-disable react/no-unused-state -- state is passed to context provider */
    this.setState({
      component: null,
      props: {},
    });
    /* eslint-enable react/no-unused-state */
  };

  override render() {
    return (
      <PanelContext.Provider value={this.state}>
        {this.props.children}
      </PanelContext.Provider>
    );
  }
}
