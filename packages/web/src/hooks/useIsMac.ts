import { useSyncExternalStore } from "react";

// eslint-disable-next-line unicorn/consistent-function-scoping
const subscribe = () => () => {
  // noop
};
const getSnapshot = () => navigator.platform.toUpperCase().includes("MAC");
const getServerSnapshot = () => true; // assume Mac on server

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
