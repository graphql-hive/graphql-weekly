import { Component, ComponentType, ReactNode } from "react"
import PanelContext, { PanelContextValue } from "./PanelContext"

interface PanelProviderProps {
  children: ReactNode
}

export default class PanelProvider extends Component<PanelProviderProps, PanelContextValue> {
  constructor(props: PanelProviderProps) {
    super(props)
    this.state = {
      component: null,
      props: {},
      showPanel: this.showPanel,
      hidePanel: this.hidePanel
    }
  }

  showPanel = (component: ComponentType<{ onPanelClose: () => void }>, props: Record<string, unknown> = {}) => {
    this.setState({
      component,
      props: {
        ...props,
        isOpen: true
      }
    })
  }

  hidePanel = () => {
    this.setState({
      component: null,
      props: {}
    })
  }

  override render() {
    return (
      <PanelContext.Provider value={this.state}>
        {this.props.children}
      </PanelContext.Provider>
    )
  }
}
