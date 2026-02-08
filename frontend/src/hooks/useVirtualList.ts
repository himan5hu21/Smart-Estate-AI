import { useCallback, useState } from "react";

interface UseVirtualListProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // extra items for smooth scroll
}

export function useVirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );

  const totalHeight = itemCount * itemHeight;

  const startIndex = Math.max(
    Math.floor(scrollTop / itemHeight) - overscan,
    0
  );

  const visibleCount =
    Math.ceil(containerHeight / itemHeight) + overscan * 2;

  const endIndex = Math.min(
    startIndex + visibleCount,
    itemCount - 1
  );

  const offsetTop = startIndex * itemHeight;

  return {
    onScroll,
    totalHeight,
    startIndex,
    endIndex,
    offsetTop,
  };
}