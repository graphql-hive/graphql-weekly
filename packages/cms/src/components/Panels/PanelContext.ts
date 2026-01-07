import { ComponentType, createContext } from "react";

export interface PanelContextValue {
  component: ComponentType<{ onPanelClose: () => void }> | null;
  props: Record<string, unknown>;
  showPanel: (
    component: ComponentType<{ onPanelClose: () => void }>,
    props?: Record<string, unknown>,
  ) => void;
  hidePanel: () => void;
}

export default createContext<PanelContextValue>({
  component: null,
  props: {},
  showPanel: () => {},
  hidePanel: () => {},
});
