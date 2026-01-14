import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => navigator.platform.toUpperCase().includes("MAC");
const getServerSnapshot = () => true; // assume Mac on server

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
