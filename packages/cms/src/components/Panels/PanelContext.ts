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

// eslint-disable-next-line @typescript-eslint/no-empty-function -- context defaults
const noop = () => {};

export const PanelContext = createContext<PanelContextValue>({
  component: null,
  hidePanel: noop,
  props: {},
  showPanel: noop,
});
