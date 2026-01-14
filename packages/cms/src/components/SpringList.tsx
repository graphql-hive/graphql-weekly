import type { ReactNode } from "react";

import { animated, useSprings } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const swap = <T,>(arr: T[], from: number, to: number): T[] => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item!);
  return copy;
};

// Narrower type that excludes bigint (unsupported by react-spring animated components)
type AnimatableNode = Exclude<ReactNode, bigint>;

export type SpringListProps = {
  children: AnimatableNode[];
  onDragEnd?: (newOrder: number[]) => void;
};

export default function SpringList({ children, onDragEnd }: SpringListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeights = useRef<number[]>([]);
  const order = useRef(children.map((_, i) => i));
  const [containerHeight, setContainerHeight] = useState(0);
  const isDragging = useRef(false);

  const getYPositions = useCallback((orderList: number[]) => {
    const positions: number[] = [];
    let cumulative = 0;
    for (const idx of orderList) {
      positions[idx] = cumulative;
      cumulative += itemHeights.current[idx] || 0;
    }
    return positions;
  }, []);

  const [springs, api] = useSprings(children.length, () => ({
    immediate: false,
    scale: 1,
    shadow: 0,
    y: 0,
    zIndex: 0,
  }));

  const measureHeights = useCallback(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(".spring-item");
    const heights: number[] = [];
    for (const [i, item] of items.entries()) {
      heights[i] = (item as HTMLElement).offsetHeight;
    }
    itemHeights.current = heights;
    setContainerHeight(heights.reduce((sum, h) => sum + h, 0));

    const positions = getYPositions(order.current);
    api.start((i) => ({ immediate: true, y: positions[i] }));
  }, [api, getYPositions]);

  useLayoutEffect(() => {
    if (!isDragging.current) {
      order.current = children.map((_, i) => i);
    }
    measureHeights();
  }, [children.length, measureHeights, children]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (!isDragging.current) measureHeights();
    });
    if (containerRef.current) {
      for (const item of containerRef.current.querySelectorAll(".spring-item"))
        resizeObserver.observe(item);
    }
    return () => resizeObserver.disconnect();
  }, [children.length, measureHeights]);

  const bind = useDrag(
    ({ active, args: [originalIndex], movement: [, my] }) => {
      isDragging.current = active;

      const curIdx = order.current.indexOf(originalIndex);
      const positions = getYPositions(order.current);
      const currentY = positions[originalIndex]! + my;

      let targetIdx = curIdx;
      let cumY = 0;
      for (let i = 0; i < order.current.length; i++) {
        const idx = order.current[i]!;
        const h = itemHeights.current[idx] || 0;
        if (currentY < cumY + h / 2) {
          targetIdx = i;
          break;
        }
        cumY += h;
        targetIdx = i + 1;
      }
      targetIdx = clamp(targetIdx, 0, children.length - 1);

      const newOrder = swap(order.current, curIdx, targetIdx);
      const newPositions = getYPositions(newOrder);

      api.start((i) => {
        if (i === originalIndex) {
          return {
            immediate: (key: string) => key === "zIndex",
            scale: active ? 1.02 : 1,
            shadow: active ? 12 : 0,
            y: positions[originalIndex]! + my,
            zIndex: active ? 10 : 0,
          };
        }
        return {
          immediate: false,
          scale: 1,
          shadow: 0,
          y: newPositions[i],
          zIndex: 0,
        };
      });

      if (!active) {
        order.current = newOrder;
        const finalPositions = getYPositions(order.current);
        api.start((i) => ({
          immediate: false,
          scale: 1,
          shadow: 0,
          y: finalPositions[i],
          zIndex: 0,
        }));
        onDragEnd?.(order.current);
      }
    },
  );

  return (
    <div
      className="spring-list"
      ref={containerRef}
      style={{ height: containerHeight, position: "relative" }}
    >
      {springs.map(({ scale, shadow, y, zIndex }, i) => {
        // Type assertion needed due to react-spring/use-gesture type incompatibility with React 19
        const gestureHandlers = bind(i) as React.HTMLAttributes<HTMLDivElement>;
        return (
          <animated.div
            {...gestureHandlers}
            className="spring-item"
            key={i}
            style={{
              boxShadow: shadow.to(
                (s) => `0 ${s}px ${s * 2.5}px rgba(0,0,0,0.12)`,
              ),
              position: "absolute",
              scale,
              touchAction: "none",
              transform: y.to((yVal) => `translate3d(0, ${yVal}px, 0)`),
              width: "100%",
              zIndex,
            }}
          >
            {/* Bridge React 19 ReactNode to react-spring's expected type */}
            {children[i] as unknown as JSX.Element}
          </animated.div>
        );
      })}
    </div>
  );
}
