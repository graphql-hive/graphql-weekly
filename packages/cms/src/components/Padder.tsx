import type { ComponentProps } from "react";

export default function Padder(props: ComponentProps<"div">) {
  return <div {...props} className={`p-[30px] ${props.className ?? ""}`} />;
}
