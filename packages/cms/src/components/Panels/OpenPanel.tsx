import { ComponentType, ReactNode } from "react"
import PanelConsumer from "./PanelConsumer"

interface OpenPanelRenderProps {
  showPanel: (component: ComponentType<{ onPanelClose: () => void }>, props?: Record<string, unknown>) => void
}

interface OpenPanelProps {
  children: (props: OpenPanelRenderProps) => ReactNode
}

export default function OpenPanel({ children }: OpenPanelProps) {
  return (
    <PanelConsumer>
      {({ showPanel }) => children({ showPanel })}
    </PanelConsumer>
  )
}
