import React from "react";
import { useVirtualList } from "../hooks/useVirtualList";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
}: VirtualListProps<T>) {
  const {
    onScroll,
    totalHeight,
    startIndex,
    endIndex,
    offsetTop,
  } = useVirtualList({
    itemCount: items.length,
    itemHeight,
    containerHeight: height,
    overscan,
  });

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Only show scrollbar if content exceeds container height
  const shouldShowScrollbar = totalHeight > height;

  return (
    <div
      style={
        shouldShowScrollbar
          ? {
              height,
              overflowY: "auto",
              position: "relative",
            }
          : {
              height: Math.min(totalHeight, height),
              overflowY: "hidden",
              position: "relative",
            }
      }
      onScroll={onScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items */}
        <div
          style={{
            position: "absolute",
            top: offsetTop,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) =>
            renderItem(item, startIndex + i)
          )}
        </div>
      </div>
    </div>
  );
}