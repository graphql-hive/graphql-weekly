import React from "react";
import PanelConsumer from "./PanelConsumer";

export default function OpenPanel({ children }) {
  return (
    <PanelConsumer>
      {({ showPanel }) => {
        return children({ showPanel });
      }}
    </PanelConsumer>
  );
}
