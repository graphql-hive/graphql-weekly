import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { animated, useSprings } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const swap = <T,>(arr: T[], from: number, to: number): T[] => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item!);
  return copy;
};

export type SpringListProps = {
  onDragEnd?: (newOrder: number[]) => void;
  children: ReactNode[];
};

export default function SpringList({ onDragEnd, children }: SpringListProps) {
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
    y: 0,
    scale: 1,
    zIndex: 0,
    shadow: 0,
    immediate: false,
  }));

  const measureHeights = useCallback(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(".spring-item");
    const heights: number[] = [];
    items.forEach((item, i) => {
      heights[i] = (item as HTMLElement).offsetHeight;
    });
    itemHeights.current = heights;
    setContainerHeight(heights.reduce((sum, h) => sum + h, 0));

    const positions = getYPositions(order.current);
    api.start((i) => ({ y: positions[i], immediate: true }));
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
      containerRef.current
        .querySelectorAll(".spring-item")
        .forEach((item) => resizeObserver.observe(item));
    }
    return () => resizeObserver.disconnect();
  }, [children.length, measureHeights]);

  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [, my] }) => {
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
            y: positions[originalIndex]! + my,
            scale: active ? 1.02 : 1,
            zIndex: active ? 10 : 0,
            shadow: active ? 12 : 0,
            immediate: (key: string) => key === "zIndex",
          };
        }
        return {
          y: newPositions[i],
          scale: 1,
          zIndex: 0,
          shadow: 0,
          immediate: false,
        };
      });

      if (!active) {
        order.current = newOrder;
        const finalPositions = getYPositions(order.current);
        api.start((i) => ({
          y: finalPositions[i],
          scale: 1,
          zIndex: 0,
          shadow: 0,
          immediate: false,
        }));
        onDragEnd?.(order.current);
      }
    }
  );

  return (
    <div
      ref={containerRef}
      className="spring-list"
      style={{ position: "relative", height: containerHeight }}
    >
      {springs.map(({ y, scale, zIndex, shadow }, i) => (
        <animated.div
          {...bind(i)}
          key={i}
          className="spring-item"
          style={{
            position: "absolute",
            width: "100%",
            zIndex,
            transform: y.to((yVal) => `translate3d(0, ${yVal}px, 0)`),
            scale,
            boxShadow: shadow.to(
              (s) => `0 ${s}px ${s * 2.5}px rgba(0,0,0,0.12)`
            ),
            touchAction: "none",
          }}
        >
          {children[i]}
        </animated.div>
      ))}
    </div>
  );
}
