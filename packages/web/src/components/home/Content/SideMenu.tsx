import type { ReactNode } from "react";

import { cn } from "../../../lib/cn";
import { Link } from "../../shared/Link";
import { getTopicColor } from "../topicColors";

interface Props {
  heading: string;
  isExpanded?: boolean;
  items: {
    extraTop?: boolean;
    href?: string;
    icon?: ReactNode;
    onClick?: () => void;
    selected?: boolean;
    text: string;
    to?: string;
  }[];
  primaryColor?: string;
}

export const SideMenu = ({ heading, isExpanded, items }: Props) => {
  return (
    <div className="ml-[23px] pb-6">
      <div className="mb-2 font-medium leading-none text-lg uppercase text-light-dark">
        {heading}
      </div>
      <div className={cn(isExpanded && "overflow-y-scroll max-h-[600px]")}>
        {items &&
          items.map((e) => {
            const topicColor = getTopicColor(e.text);
            return (
              <Link
                className={cn(
                  "flex items-center w-full no-underline font-medium leading-[18px] text-lg align-middle text-footer-dark",
                  "-ml-2 pl-2 -mr-2 pr-2 py-1 rounded-sm hover:bg-[#8683d40c] transition-colors focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-0",
                  e.extraTop ? "mt-5" : "mt-3",
                )}
                href={e.href}
                key={e.text + e.to}
                onClick={e.onClick}
                style={e.selected ? { color: topicColor } : undefined}
                to={e.to}
              >
                {e.selected && (
                  <div
                    className="w-2 h-2 rounded-full -ml-[23px] mr-[15px]"
                    style={{ background: topicColor }}
                  />
                )}
                {e.icon && (
                  <div className="mr-[15px] mt-px -mb-px">{e.icon}</div>
                )}
                {e.text}
              </Link>
            );
          })}
      </div>
    </div>
  );
};
