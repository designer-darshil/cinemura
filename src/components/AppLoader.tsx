import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

interface AppLoaderProps {
  isReady?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ isReady: propIsReady }) => {
  const { isAppReady } = useApp();
  const ready = propIsReady !== undefined ? propIsReady : isAppReady;

  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  // Dynamic initial curve based on screen width
  // Desktop: ~200px, Tablet: ~160px, Mobile: ~130px
  const getCurveDepth = (width: number) => {
    if (width < 640) return 130;
    if (width < 1024) return 160;
    return 200;
  };

  const getDimensions = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const curve = getCurveDepth(width);
    const totalHeight = height + curve;
    return { width, height, curve, totalHeight };
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  // Construct quadratic Bézier path:
  // M0 0 L{width} 0 L{width} {height} Q{width/2} {height - currentCurve} 0 {height} L0 0
  const buildPathString = (width: number, totalHeight: number, currentCurve: number) => {
    const halfWidth = width / 2;
    const controlY = totalHeight - currentCurve;
    return `M0 0 L${width} 0 L${width} ${totalHeight} Q${halfWidth} ${controlY} 0 ${totalHeight} L0 0`;
  };

  // Resize handler to recalculate dimensions before exit
  useEffect(() => {
    const handleResize = () => {
      if (hasStartedRef.current) return;
      const dims = getDimensions();
      setDimensions(dims);
      if (pathRef.current) {
        pathRef.current.setAttribute('d', buildPathString(dims.width, dims.totalHeight, dims.curve));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll lock while loader is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Exit animation when application is ready
  useEffect(() => {
    if (!ready || isFinished || hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (containerRef.current) {
        containerRef.current.style.transition = 'opacity 0.25s ease-out';
        containerRef.current.style.opacity = '0';
      }
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
        setIsFinished(true);
      }, 250);
      return () => clearTimeout(timer);
    }

    // Short micro-delay (70ms) to ensure ready application has completed paint
    const startDelayTimer = setTimeout(() => {
      const { width, totalHeight, curve: initialCurve } = dimensions;
      const duration = 750; // ms (smooth ease-out within 600-800ms)
      let startTime: number | null = null;

      // Smooth cubic ease-out for deliberate, premium motion (no bounce/spring)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = easeOutCubic(progress);

        // 1. GPU-accelerated upward slide of the entire curved panel
        const currentTranslateY = -totalHeight * ease;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
        }

        // 2. Progressive flattening of the bottom curve (initialCurve -> 0)
        const currentCurve = initialCurve * (1 - ease);
        if (pathRef.current) {
          pathRef.current.setAttribute('d', buildPathString(width, totalHeight, currentCurve));
        }

        // 3. Subtle wordmark opacity fade during initial upward motion
        if (wordmarkRef.current) {
          const fadeProgress = Math.min(1, ease * 2.5);
          wordmarkRef.current.style.opacity = String(1 - fadeProgress);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          // Animation complete: clean up and remove overlay
          document.body.style.overflow = '';
          setIsFinished(true);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    }, 70);

    return () => {
      clearTimeout(startDelayTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [ready, dimensions, isFinished]);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full z-[9999] pointer-events-auto select-none overflow-hidden"
      style={{
        height: `${dimensions.totalHeight}px`,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <svg
        width={dimensions.width}
        height={dimensions.totalHeight}
        viewBox={`0 0 ${dimensions.width} ${dimensions.totalHeight}`}
        className="w-full h-full block"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          fill="#0B0B0D"
          d={buildPathString(dimensions.width, dimensions.totalHeight, dimensions.curve)}
        />
      </svg>

      {/* Small Minimal Brand Wordmark */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ height: `${dimensions.height}px` }}
      >
        <span className="font-display font-bold text-lg sm:text-3xl text-[#F2F0EC] tracking-[0.3em] uppercase">
          CINEMURA
        </span>
      </div>
    </div>
  );
};

export default AppLoader;
