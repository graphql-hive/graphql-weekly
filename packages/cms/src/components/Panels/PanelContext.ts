import { ComponentType, createContext } from "react";

export interface PanelContextValue {
  component: ComponentType<{ onPanelClose: () => void }> | null;
  hidePanel: () => void;
  props: Record<string, unknown>;
  showPanel: (
    component: ComponentType<{ onPanelClose: () => void }>,
    props?: Record<string, unknown>,
  ) => void;
}

export default createContext<PanelContextValue>({
  component: null,
  hidePanel: () => {},
  props: {},
  showPanel: () => {},
});
