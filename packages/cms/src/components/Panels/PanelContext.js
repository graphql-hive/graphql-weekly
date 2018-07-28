import { createContext } from 'react';

export default createContext({
  component: null,
  props: {},
  showPanel: () => {},
  hidePanel: () => {},
});
