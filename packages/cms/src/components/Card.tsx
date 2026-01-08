import type { ComponentProps } from "react";

export default function Card(props: ComponentProps<"section">) {
  return (
    <section
      {...props}
      className={`max-w-[1000px] mx-auto my-6 bg-white rounded-lg shadow-[0px_3px_3px_rgba(12,52,75,0.05)] relative p-6 ${props.className ?? ""}`}
    />
  );
}
