import React from "react";
import PanelContext from "./PanelContext";

export default class PanelProvider extends React.Component {
  constructor() {
    super();
    this.showPanel = this.showPanel.bind(this);
    this.hidePanel = this.hidePanel.bind(this);

    this.state = {
      component: null,
      props: {},
      showPanel: this.showPanel,
      hidePanel: this.hidePanel
    };
  }

  showPanel(component, props = {}) {
    this.setState({
      component,
      props: {
        ...props,
        isOpen: true
      }
    });
  }

  hidePanel() {
    return this.setState({
      component: null,
      props: {}
    });
  }

  render() {
    return (
      <PanelContext.Provider value={this.state}>
        {this.props.children}
      </PanelContext.Provider>
    );
  }
}
