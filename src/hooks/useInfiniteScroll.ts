import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export interface UseInfiniteScrollOptions {
  totalItems: number;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  resetDeps?: React.DependencyList;
}

/**
 * Returns current CSS grid column count based on Tailwind breakpoints:
 * grid-cols-2 sm:grid-cols-4 lg:grid-cols-6
 */
function getGridColumnCount(): number {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
}

/**
 * Calculates the 0-indexed item that represents the start of the second-last row.
 * Returns -1 if the dataset is too small to form at least 2 full rows.
 */
export function calculateSecondLastRowIndex(totalItems: number, cols: number = getGridColumnCount()): number {
  if (totalItems <= 0) return -1;
  const totalRows = Math.ceil(totalItems / cols);
  // Need at least 2 rows to have a meaningful second-last row trigger
  if (totalRows < 2) return -1;

  const secondLastRow = totalRows - 2;
  return secondLastRow * cols;
}

/**
 * Checks whether the site footer is currently visible within the browser viewport.
 * Per requirements: Scrolling to or viewing the footer must NEVER trigger pagination.
 */
function isFooterInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const footer = document.querySelector('footer');
  if (!footer) return false;
  const rect = footer.getBoundingClientRect();
  const vHeight = window.innerHeight || document.documentElement.clientHeight;
  // True if any part of the footer is visible inside the viewport
  return rect.top < vHeight && rect.bottom > 0;
}

/**
 * Hook for second-last row infinite scrolling with:
 * 1. Request latch (one request per sentinel entry)
 * 2. Re-arm only after trigger leaves the viewport
 * 3. Footer visibility guard (never trigger on footer reach)
 * 4. Stale/duplicate request protection
 * 5. Dynamic trigger relocation as data appends
 */
export function useInfiniteScroll({
  totalItems,
  loading,
  hasMore,
  onLoadMore,
  resetDeps = []
}: UseInfiniteScrollOptions) {
  const [cols, setCols] = useState<number>(getGridColumnCount);

  // Responsive column tracker
  useEffect(() => {
    const handleResize = () => {
      const newCols = getGridColumnCount();
      setCols((prev) => (prev !== newCols ? newCols : prev));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute the current second-last row trigger index
  const triggerIndex = useMemo(() => {
    if (!hasMore || loading && totalItems === 0) return -1;
    return calculateSecondLastRowIndex(totalItems, cols);
  }, [totalItems, cols, hasMore, loading]);

  // State machine refs for request latch and disarm/re-arm
  const prefetchArmedRef = useRef(true);
  const nextPageRequestedRef = useRef(false);
  const currentElementRef = useRef<HTMLElement | null>(null);

  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Reset infinite scroll latch when route/filter/query dependencies change
  useEffect(() => {
    prefetchArmedRef.current = true;
    nextPageRequestedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  // Attempt to trigger next page if all conditions are met
  const attemptTrigger = useCallback(() => {
    if (
      !prefetchArmedRef.current ||
      nextPageRequestedRef.current ||
      loadingRef.current ||
      !hasMoreRef.current
    ) {
      return;
    }

    // Guard: If footer is visible, do NOT trigger infinite scroll
    if (isFooterInViewport()) {
      return;
    }

    // Latch immediately to prevent duplicate requests
    nextPageRequestedRef.current = true;
    prefetchArmedRef.current = false;
    onLoadMoreRef.current();
  }, []);

  // IntersectionObserver instance
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            // Re-arm only after the trigger element has left the viewport
            prefetchArmedRef.current = true;
            nextPageRequestedRef.current = false;
            continue;
          }

          // Entered viewport: attempt trigger with latch and footer protection
          attemptTrigger();
        }
      },
      {
        root: null,
        rootMargin: '0px', // Exact viewport entry for second-last row
        threshold: 0
      }
    );

    observerRef.current = observer;

    if (currentElementRef.current) {
      observer.observe(currentElementRef.current);
    }

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [attemptTrigger]);

  // Window scroll listener to safely catch re-entries (e.g. scrolling back up from footer)
  useEffect(() => {
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (!currentElementRef.current) return;
        if (!prefetchArmedRef.current || nextPageRequestedRef.current) return;
        if (loadingRef.current || !hasMoreRef.current) return;

        // Verify if element is intersecting and footer is not visible
        const rect = currentElementRef.current.getBoundingClientRect();
        const vHeight = window.innerHeight || document.documentElement.clientHeight;
        const isElementVisible = rect.top < vHeight && rect.bottom > 0;

        if (isElementVisible && !isFooterInViewport()) {
          attemptTrigger();
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [attemptTrigger]);

  // Callback ref to attach to the card at triggerIndex
  const triggerRef = useCallback((node: HTMLElement | null) => {
    if (currentElementRef.current === node) return;

    if (currentElementRef.current && observerRef.current) {
      observerRef.current.unobserve(currentElementRef.current);
    }

    currentElementRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  return {
    triggerIndex,
    triggerRef,
    isTrigger: (index: number) => index === triggerIndex && triggerIndex !== -1
  };
}
