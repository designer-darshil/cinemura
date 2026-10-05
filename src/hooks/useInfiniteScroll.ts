import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  rootMargin = '500px 0px'
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.1
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, onLoadMore, rootMargin]);

  return sentinelRef;
}
